
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Dtos;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
public class HoldsController : ControllerBase
{


    [HttpPost("/holds/{holdId:guid}/confirm")]
public async Task<IActionResult> ConfirmHold(
    Guid holdId,
    [FromHeader(Name = "X-Student-Id")] string? studentId)
{
    if (string.IsNullOrWhiteSpace(studentId))
        return BadRequest("X-Student-Id header is required.");

    await using var transaction =
        await _context.Database.BeginTransactionAsync();

    var hold = await _context.AdmissionHolds
        .FirstOrDefaultAsync(h => h.Id == holdId);

    if (hold == null)
        return NotFound("Hold not found.");

    if (hold.StudentId != studentId)
        return Forbid();

    // Lock the class row to coordinate admission operations.
    var schoolClass = await _context.GetClassForUpdateAsync(
        hold.SchoolClassId);

    if (schoolClass == null)
        return NotFound("Class not found.");

    if (hold.Status != "HELD")
        return Conflict($"Hold cannot be confirmed. Current status: {hold.Status}");

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
    private readonly ApplicationDbContext _context;

    public HoldsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpPost("classes/{classId:int}/holds")]
    public async Task<IActionResult> CreateHold(
        int classId,
        [FromHeader(Name = "X-Student-Id")] string studentId,
        [FromBody] CreateHoldRequest request)
    {
        if (string.IsNullOrWhiteSpace(studentId) ||
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
            var schoolClass =
                await _context.GetClassForUpdateAsync(classId);

            if (schoolClass == null)
                return NotFound("Class not found.");

            var student = await _context.Students
                .FirstOrDefaultAsync(s =>
                    s.BirthRegistrationNumber == studentId);

            if (student == null)
            {
                student = new Student
                {
                    BirthRegistrationNumber = studentId,
                    FullName = request.FullName,
                    DateOfBirth = DateTime.SpecifyKind(
                        request.DateOfBirth, DateTimeKind.Utc),
                    GuardianName = request.GuardianName,
                    GuardianPhone = request.GuardianPhone
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync();
            }

            var now = DateTime.UtcNow;

            var expiredHolds = await _context.AdmissionHolds
                .Where(h => h.SchoolClassId == classId &&
                            h.Status == "HELD" &&
                            h.ExpiresAt <= now)
                .ToListAsync();

            foreach (var hold in expiredHolds)
                hold.Status = "EXPIRED";

            var occupiedSeats = await _context.AdmissionHolds
                .CountAsync(h => h.SchoolClassId == classId &&
                    (h.Status == "CONFIRMED" ||
                     (h.Status == "HELD" && h.ExpiresAt > now)));

            if (occupiedSeats >= schoolClass.TotalSeats)
            {
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Conflict("No seats available.");
            }

            var admissionHold = new AdmissionHold
            {
                StudentId = studentId,
                SchoolClassId = classId,
                CreatedAt = now,
                ExpiresAt = now.AddMinutes(10),
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

    [HttpGet("/holds/{holdId:guid}")]
    public async Task<IActionResult> GetHold(Guid holdId)
    {
        var hold = await _context.AdmissionHolds
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
            return NotFound("Hold not found.");

        // Automatically mark an expired hold.
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
        if (string.IsNullOrWhiteSpace(studentId))
            return BadRequest("X-Student-Id header is required.");

        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var hold = await _context.AdmissionHolds
            .FirstOrDefaultAsync(h => h.Id == holdId);

        if (hold == null)
            return NotFound("Hold not found.");

        if (hold.StudentId != studentId)
            return Forbid();

        // Lock the class row before changing the hold.
        await _context.GetClassForUpdateAsync(hold.SchoolClassId);

        // Reload the hold after acquiring the lock.
        await _context.Entry(hold).ReloadAsync();

        if (hold.Status != "HELD")
            return Conflict($"Hold cannot be cancelled. Current status: {hold.Status}");

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
        if (string.IsNullOrWhiteSpace(studentId))
            return BadRequest("X-Student-Id header is required.");

        var holds = await _context.AdmissionHolds
            .Where(h => h.StudentId == studentId)
            .OrderByDescending(h => h.CreatedAt)
            .ToListAsync();

        return Ok(holds);
    }

}
