namespace SchoolAdmission.Api.Dtos;

public class CreateHoldRequest
{
    public string FullName { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public string GuardianName { get; set; } = string.Empty;

    public string GuardianPhone { get; set; } = string.Empty;
}