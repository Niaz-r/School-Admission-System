using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Npgsql;
using SchoolAdmission.Api.Controllers;
using SchoolAdmission.Api.Data;
using SchoolAdmission.Api.Dtos;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Tests;

[CollectionDefinition("PostgreSQL integration tests", DisableParallelization = true)]
public class PostgreSqlTestCollection
{
}

[Collection("PostgreSQL integration tests")]
public class HoldsControllerTests : IAsyncLifetime
{
    private string _connectionString = string.Empty;

    private IConfiguration _configuration = null!;

    public async Task InitializeAsync()
    {
        var secrets = new ConfigurationBuilder()
            .AddUserSecrets("abbb55de-97c0-4466-961d-b128b626d6f0")
            .Build();

        var originalConnectionString =
            secrets.GetConnectionString("DefaultConnection");

        if (string.IsNullOrWhiteSpace(originalConnectionString))
        {
            throw new InvalidOperationException(
                "Database connection string was not found in User Secrets.");
        }

        var connectionBuilder =
            new NpgsqlConnectionStringBuilder(originalConnectionString)
            {
                Database = "school_admission_test"
            };

        _connectionString = connectionBuilder.ConnectionString;

        _configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["HOLD_DURATION_SECONDS"] = "600"
            })
            .Build();

        await using var context = CreateDbContext();
        await context.Database.MigrateAsync();
    }

    public Task DisposeAsync()
    {
        return Task.CompletedTask;
    }

    private ApplicationDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(_connectionString)
            .Options;

        return new ApplicationDbContext(options);
    }

    private HoldsController CreateController(ApplicationDbContext context)
    {
        return new HoldsController(context, _configuration);
    }

    private async Task<int> CreateTestClassAsync(int totalSeats)
    {
        await using var context = CreateDbContext();

        var schoolClass = new SchoolClass
        {
            Name = "Test Class " + Guid.NewGuid(),
            Shift = "Morning",
            TotalSeats = totalSeats
        };

        context.SchoolClasses.Add(schoolClass);
        await context.SaveChangesAsync();

        return schoolClass.Id;
    }

    private static CreateHoldRequest CreateValidRequest()
    {
        return new CreateHoldRequest
        {
            FullName = "Test Student",
            DateOfBirth = DateTime.UtcNow.AddYears(-10),
            GuardianName = "Test Guardian",
            GuardianPhone = "01700000000"
        };
    }

    [Fact]
    public async Task CreateHold_InvalidStudentId_ReturnsBadRequest()
    {
        await using var context = CreateDbContext();

        var controller = CreateController(context);

        var result = await controller.CreateHold(
            1,
            "12345",
            CreateValidRequest());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task CreateHold_DuplicateApplication_ReturnsConflict()
    {
        var classId = await CreateTestClassAsync(5);
        const string studentId = "12345678901234567";

        await using (var firstContext = CreateDbContext())
        {
            var firstController = CreateController(firstContext);

            var firstResult = await firstController.CreateHold(
                classId,
                studentId,
                CreateValidRequest());

            Assert.IsType<OkObjectResult>(firstResult);
        }

        await using (var secondContext = CreateDbContext())
        {
            var secondController = CreateController(secondContext);

            var secondResult = await secondController.CreateHold(
                classId,
                studentId,
                CreateValidRequest());

            Assert.IsType<ConflictObjectResult>(secondResult);
        }
    }

    [Fact]
    public async Task CreateHold_ConcurrentRequests_DoNotExceedCapacity()
    {
        const int totalSeats = 1;
        const int numberOfRequests = 10;

        var classId = await CreateTestClassAsync(totalSeats);

        var tasks = Enumerable.Range(0, numberOfRequests)
            .Select(async index =>
            {
                var studentId = "1" + index.ToString("D16");

                await using var context = CreateDbContext();

                var controller = CreateController(context);

                return await controller.CreateHold(
                    classId,
                    studentId,
                    CreateValidRequest());
            });

        var results = await Task.WhenAll(tasks);

        var successfulRequests = results
            .OfType<OkObjectResult>()
            .Count();

        await using var verificationContext = CreateDbContext();

        var occupiedSeats = await verificationContext.AdmissionHolds
            .CountAsync(h =>
                h.SchoolClassId == classId &&
                (h.Status == "CONFIRMED" ||
                 (h.Status == "HELD" && h.ExpiresAt > DateTime.UtcNow)));

        Assert.Equal(1, successfulRequests);
        Assert.Equal(1, occupiedSeats);
        Assert.True(occupiedSeats <= totalSeats);
    }
}
