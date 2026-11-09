namespace SchoolAdmission.Api.Models;

public class AdmissionHold
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string StudentId { get; set; } = string.Empty;

    public int SchoolClassId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAt { get; set; }

    public string Status { get; set; } = "HELD";
}