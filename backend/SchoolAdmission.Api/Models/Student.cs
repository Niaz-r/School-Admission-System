namespace SchoolAdmission.Api.Models;

public class Student
{
    public string BirthRegistrationNumber { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public DateTime DateOfBirth { get; set; }

    public string GuardianName { get; set; } = string.Empty;

    public string GuardianPhone { get; set; } = string.Empty;
}