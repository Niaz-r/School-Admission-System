
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Dtos;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
public class HoldsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public HoldsController(
        ApplicationDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    private static bool IsValidStudentId(string? studentId)
    {
        return !string.IsNullOrWhiteSpace(studentId) &&
               studentId.Length == 17 &&
               studentId.All(c => c >= '0' && c <= '9');
    }

    private int GetHoldDurationSeconds()
    {
        if (!int.TryParse(
                _configuration["HOLD_DURATION_SECONDS"],
                out var seconds) ||
            seconds <= 0)
        {
            return 600;
        }

        return seconds;
    }

    [HttpPost("classes/{classId:int}/holds")]
    public async Task<IActionResult> CreateHold(
        int classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        [FromBody] CreateHoldRequest request)
    {
        if (!IsValidStudentId(studentId))
            return BadRequest("A valid 17-digit Birth Registration Number is required.");

        if (request == null ||
            string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.GuardianName) ||
            string.IsNullOrWhiteSpace(request.GuardianPhone) ||
            request.DateOfBirth == default ||
            request.DateOfBirth.Date >= DateTime.UtcNow.Date)
        {
            return BadRequest("Valid student and guardian information is required.");
        }

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        try
        {
            // Lock the class row to coordinate concurrent reservations.
            var schoolClass =
                await _context.GetClassForUpdateAsync(classId);

            if (schoolClass == null)
                return NotFound("Class not found.");

            var now = DateTime.UtcNow;

            // Mark expired holds before checking duplicate applications.
            var expiredHolds = await _context.AdmissionHolds
                .Where(h =>
                    h.SchoolClassId == classId &&
                    h.Status == "HELD" &&
                    h.ExpiresAt <= now)
                .ToListAsync();

            foreach (var expiredHold in expiredHolds)
                expiredHold.Status = "EXPIRED";

            await _context.SaveChangesAsync();

            // A student cannot have another active or confirmed
            // application for the same class.
            var existingApplication =
                await _context.AdmissionHolds.AnyAsync(h =>
                    h.StudentId == studentId &&
                    h.SchoolClassId == classId &&
                    (h.Status == "CONFIRMED" ||
                     (h.Status == "HELD" && h.ExpiresAt > now)));

            if (existingApplication)
            {
                await transaction.CommitAsync();

                return Conflict(
                    "You already have an active or confirmed application for this class.");
            }

            // Check available capacity.
            var occupiedSeats = await _context.AdmissionHolds
                .CountAsync(h =>
                    h.SchoolClassId == classId &&
                    (h.Status == "CONFIRMED" ||
                     (h.Status == "HELD" && h.ExpiresAt > now)));

            if (occupiedSeats >= schoolClass.TotalSeats)
            {
                await transaction.CommitAsync();
                return Conflict("No seats available.");
            }

            // Find or create the student.
            var student = await _context.Students
                .FirstOrDefaultAsync(s =>
                    s.BirthRegistrationNumber == studentId);

            if (student == null)
            {
                student = new Student
                {
                    BirthRegistrationNumber = studentId!,
                    FullName = request.FullName,
                    DateOfBirth = DateTime.SpecifyKind(
                        request.DateOfBirth, DateTimeKind.Utc),
                    GuardianName = request.GuardianName,
                    GuardianPhone = request.GuardianPhone
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }

            // Create the temporary reservation.
            var admissionHold = new AdmissionHold
            {
                StudentId = studentId!,
                SchoolClassId = classId,
                CreatedAt = now,
                ExpiresAt = now.AddSeconds(GetHoldDurationSeconds()),
                Status = "HELD"
            };

            _context.AdmissionHolds.Add(admissionHold);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(admissionHold);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    [HttpPost("/holds/{holdId:guid}/confirm")]
    public async Task<IActionResult> ConfirmHold(
        Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (!IsValidStudentId(studentId))
            return BadRequest("A valid 17-digit Birth Registration Number is required.");

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var hold = await _context.AdmissionHolds
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
            return NotFound("Hold not found.");

        if (hold.StudentId != studentId)
            return Forbid();

        // Lock the class row before changing the reservation.
        var schoolClass = await _context.GetClassForUpdateAsync(
            hold.SchoolClassId);

        if (schoolClass == null)
            return NotFound("Class not found.");

        // Reload the hold after acquiring the lock.
        await _context.Entry(hold).ReloadAsync();

        if (hold.StudentId != studentId)
            return Forbid();

        // Repeated confirmation must not count another seat.
        if (hold.Status == "CONFIRMED")
        {
            await transaction.CommitAsync();
            return Ok(hold);
        }

        if (hold.Status != "HELD")
        {
            return Conflict(
                $"Hold cannot be confirmed. Current status: {hold.Status}");
        }

        if (hold.ExpiresAt <= DateTime.UtcNow)
        {
            hold.Status = "EXPIRED";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Conflict("Hold has expired.");
        }

        hold.Status = "CONFIRMED";

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(hold);
    }

    [HttpGet("/holds/{holdId:guid}")]
    public async Task<IActionResult> GetHold(Guid holdId)
    {
        var hold = await _context.AdmissionHolds
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
            return NotFound("Hold not found.");

        if (hold.Status == "HELD" &&
            hold.ExpiresAt <= DateTime.UtcNow)
        {
            hold.Status = "EXPIRED";
            await _context.SaveChangesAsync();
        }

        return Ok(hold);
    }

    [HttpDelete("/holds/{holdId:guid}")]
    public async Task<IActionResult> CancelHold(
        Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (!IsValidStudentId(studentId))
            return BadRequest("A valid 17-digit Birth Registration Number is required.");

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var hold = await _context.AdmissionHolds
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
            return NotFound("Hold not found.");

        if (hold.StudentId != studentId)
            return Forbid();

        var schoolClass = await _context.GetClassForUpdateAsync(
            hold.SchoolClassId);

        if (schoolClass == null)
            return NotFound("Class not found.");

        await _context.Entry(hold).ReloadAsync();

        if (hold.StudentId != studentId)
            return Forbid();

        if (hold.Status != "HELD")
        {
            return Conflict(
                $"Hold cannot be cancelled. Current status: {hold.Status}");
        }

        if (hold.ExpiresAt <= DateTime.UtcNow)
        {
            hold.Status = "EXPIRED";

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Conflict("Hold has expired.");
        }

        hold.Status = "CANCELLED";

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(hold);
    }

    [HttpGet("/me/holds")]
    public async Task<IActionResult> GetMyHolds(
        [FromHeader(Name = "X-Student-Id")] string? studentId)
    {
        if (!IsValidStudentId(studentId))
            return BadRequest("A valid 17-digit Birth Registration Number is required.");

        var holds = await _context.AdmissionHolds
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var changed = false;

        foreach (var hold in holds)
        {
            if (hold.Status == "HELD" && hold.ExpiresAt <= now)
            {
                hold.Status = "EXPIRED";
                changed = true;
            }
        }

        if (changed)
            await _context.SaveChangesAsync();

        return Ok(holds);
    }
}
