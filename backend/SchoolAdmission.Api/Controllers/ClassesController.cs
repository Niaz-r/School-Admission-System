using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Controllers;

[ApiController]
[Route("classes")]
public class ClassesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ClassesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetClasses()
    {
        var classes = await _context.SchoolClasses
            .OrderBy(c => c.Name)
            .ThenBy(c => c.Shift)
            .ToListAsync();

        return Ok(classes);
    }

    [HttpGet("{classId:int}")]
    public async Task<IActionResult> GetClass(int classId)
    {
        var schoolClass = await _context.SchoolClasses
            .FirstOrDefaultAsync(c => c.Id == classId);

        if (schoolClass == null)
            return NotFound();

        return Ok(schoolClass);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClass(SchoolClass schoolClass)
    {
        if (schoolClass.TotalSeats <= 0)
            return BadRequest("Total seats must be greater than zero.");

        var alreadyExists = await _context.SchoolClasses
            .AnyAsync(c =>
                c.Name == schoolClass.Name &&
                c.Shift == schoolClass.Shift);

        if (alreadyExists)
            return Conflict("This class and shift already exist.");

        _context.SchoolClasses.Add(schoolClass);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetClass),
            new { classId = schoolClass.Id },
            schoolClass);
    }
}