using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Data;
using StudentPortal.API.Models;
using BCrypt.Net;

namespace StudentPortal.API.Services
{
    public class DatabaseSeeder
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<DatabaseSeeder> _logger;

        public DatabaseSeeder(AppDbContext context, IConfiguration configuration, ILogger<DatabaseSeeder> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SeedAsync()
        {
            var seedEnabled = _configuration.GetValue<bool>("SeedData:Enabled", true);
            
            if (!seedEnabled)
            {
                _logger.LogInformation("Database seeding is disabled");
                return;
            }

            _logger.LogInformation("Starting database seeding...");

            try
            {
                // Check if users already exist
                if (await _context.Users.AnyAsync())
                {
                    _logger.LogInformation("Database already contains users. Skipping seed.");
                    return;
                }

                // Create test users
                var studentEmail = _configuration["SeedData:StudentEmail"] ?? "student@test.com";
                var studentPassword = _configuration["SeedData:StudentPassword"] ?? "Student123!";
                var teacherEmail = _configuration["SeedData:TeacherEmail"] ?? "teacher@test.com";
                var teacherPassword = _configuration["SeedData:TeacherPassword"] ?? "Teacher123!";
                var adminEmail = _configuration["SeedData:AdminEmail"] ?? "admin@test.com";
                var adminPassword = _configuration["SeedData:AdminPassword"] ?? "Admin123!";

                // Create Admin user
                var admin = new User
                {
                    Name = "Admin User",
                    Email = adminEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
                    Role = "Admin"
                };
                _context.Users.Add(admin);

                // Create Teacher user
                var teacher = new User
                {
                    Name = "Teacher Smith",
                    Email = teacherEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(teacherPassword),
                    Role = "Teacher"
                };
                _context.Users.Add(teacher);

                // Create Student user
                var student = new User
                {
                    Name = "John Doe",
                    Email = studentEmail,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(studentPassword),
                    Role = "Student"
                };
                _context.Users.Add(student);

                await _context.SaveChangesAsync();
                _logger.LogInformation("Created test users");

                // Create Student record for the student user
                var studentRecord = new Student
                {
                    UserId = student.Id
                };
                _context.Students.Add(studentRecord);
                await _context.SaveChangesAsync();
                
                _logger.LogInformation("Created student record with ID: {StudentId}", studentRecord.Id);

                // Add sample grades
                var sampleGrades = new List<Grade>
                {
                    new Grade
                    {
                        StudentId = studentRecord.Id,
                        Subject = "Mathematics",
                        Score = 92,
                        MaxScore = 100,
                        GradeType = GradeType.Exam,
                        Semester = "2026-1",
                        Comments = "Excellent work on calculus!",
                        Date = DateTime.UtcNow.AddDays(-10)
                    },
                    new Grade
                    {
                        StudentId = studentRecord.Id,
                        Subject = "Physics",
                        Score = 88,
                        MaxScore = 100,
                        GradeType = GradeType.Quiz,
                        Semester = "2026-1",
                        Comments = "Good understanding of mechanics",
                        Date = DateTime.UtcNow.AddDays(-5)
                    },
                    new Grade
                    {
                        StudentId = studentRecord.Id,
                        Subject = "Computer Science",
                        Score = 95,
                        MaxScore = 100,
                        GradeType = GradeType.Project,
                        Semester = "2026-1",
                        Comments = "Outstanding project implementation",
                        Date = DateTime.UtcNow.AddDays(-2)
                    }
                };

                _context.Grades.AddRange(sampleGrades);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Database seeding completed successfully");
                _logger.LogInformation("Test credentials:");
                _logger.LogInformation("  Admin: {AdminEmail} / {AdminPassword}", adminEmail, adminPassword);
                _logger.LogInformation("  Teacher: {TeacherEmail} / {TeacherPassword}", teacherEmail, teacherPassword);
                _logger.LogInformation("  Student: {StudentEmail} / {StudentPassword}", studentEmail, studentPassword);
                _logger.LogInformation("  Student ID: {StudentId}", studentRecord.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while seeding the database");
                throw;
            }
        }
    }
}
