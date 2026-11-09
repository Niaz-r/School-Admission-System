using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Api.Models;

namespace SchoolAdmission.Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Student> Students => Set<Student>();

    public DbSet<SchoolClass> SchoolClasses => Set<SchoolClass>();

    public DbSet<AdmissionHold> AdmissionHolds => Set<AdmissionHold>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Student>()
            .HasKey(s => s.BirthRegistrationNumber);

        modelBuilder.Entity<AdmissionHold>()
            .HasOne<Student>()
            .WithMany()
            .HasForeignKey(h => h.StudentId);

        modelBuilder.Entity<AdmissionHold>()
            .HasOne<SchoolClass>()
            .WithMany()
            .HasForeignKey(h => h.SchoolClassId);

        modelBuilder.Entity<SchoolClass>()
            .HasIndex(c => new { c.Name, c.Shift })
            .IsUnique();
    }
}