using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using StudentPortal.API.Controllers;
using StudentPortal.API.Models;
using StudentPortal.Tests.Helpers;

namespace StudentPortal.Tests.Controllers
{
    /// <summary>
    /// Unit tests for GradesController.
    /// Each test uses an isolated in-memory database (Arrange-Act-Assert pattern).
    /// </summary>
    public class GradesControllerTests
    {
        // ─────────────────────────────────────────────
        //  Helper: seed one student that grades can reference
        // ─────────────────────────────────────────────
        private static (GradesController controller, API.Data.AppDbContext context, int studentId) CreateController()
        {
            var context = TestDbContextFactory.Create();

            // Seed a User + Student so FK constraints are satisfied
            var user = new User { Name = "Test User", Email = "test@test.com", PasswordHash = "hash", Role = "Student" };
            context.Users.Add(user);
            context.SaveChanges();

            var student = new Student { UserId = user.Id, Grades = new List<Grade>() };
            context.Students.Add(student);
            context.SaveChanges();

            var logger = NullLogger<GradesController>.Instance;
            var controller = new GradesController(context, logger);

            return (controller, context, student.Id);
        }

        private static Grade ValidGrade(int studentId) => new Grade
        {
            StudentId = studentId,
            Subject = "Mathematics",
            Score = 85,
            MaxScore = 100,
            GradeType = GradeType.Exam,
            Semester = "2024-S1",
            Comments = "Good work",
            Date = DateTime.UtcNow
        };

        // ══════════════════════════════════════════════
        //  GET
        // ══════════════════════════════════════════════

        [Fact]
        public void GetGrades_ReturnsOk_WithAllGradesForStudent()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            context.Grades.AddRange(
                new Grade { StudentId = studentId, Subject = "Math",    Score = 80, MaxScore = 100, GradeType = GradeType.Exam,     Semester = "S1", Comments = "", Date = DateTime.UtcNow },
                new Grade { StudentId = studentId, Subject = "Physics", Score = 90, MaxScore = 100, GradeType = GradeType.Quiz,     Semester = "S1", Comments = "", Date = DateTime.UtcNow },
                new Grade { StudentId = studentId, Subject = "History", Score = 70, MaxScore = 100, GradeType = GradeType.Homework, Semester = "S1", Comments = "", Date = DateTime.UtcNow }
            );
            context.SaveChanges();

            // Act
            var result = controller.GetGrades(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value);
            Assert.Equal(3, grades.Count());
        }

        [Fact]
        public void GetGrades_ReturnsEmptyList_WhenNoGradesExist()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();

            // Act
            var result = controller.GetGrades(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value);
            Assert.Empty(grades);
        }

        [Fact]
        public void GetGrades_ReturnsOnlyGradesForRequestedStudent()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();

            // Add a second student
            var user2 = new User { Name = "Other", Email = "other@test.com", PasswordHash = "h", Role = "Student" };
            context.Users.Add(user2);
            context.SaveChanges();
            var student2 = new Student { UserId = user2.Id, Grades = new List<Grade>() };
            context.Students.Add(student2);
            context.SaveChanges();

            context.Grades.AddRange(
                new Grade { StudentId = studentId,    Subject = "Math",    Score = 80, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S1", Comments = "", Date = DateTime.UtcNow },
                new Grade { StudentId = student2.Id,  Subject = "Science", Score = 90, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S1", Comments = "", Date = DateTime.UtcNow }
            );
            context.SaveChanges();

            // Act
            var result = controller.GetGrades(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value);
            Assert.Single(grades);
            Assert.All(grades, g => Assert.Equal(studentId, g.StudentId));
        }

        // ══════════════════════════════════════════════
        //  ADD (POST)
        // ══════════════════════════════════════════════

        [Fact]
        public void AddGrade_ReturnsCreated_AndPersistsGrade()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var grade = ValidGrade(studentId);

            // Act
            var result = controller.AddGrade(grade);

            // Assert
            var created = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(1, context.Grades.Count());
        }

        [Fact]
        public void AddGrade_ReturnsBadRequest_WhenStudentDoesNotExist()
        {
            // Arrange
            var (controller, _, _) = CreateController();
            var grade = ValidGrade(studentId: 9999); // non-existent student

            // Act
            var result = controller.AddGrade(grade);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void AddGrade_ReturnsBadRequest_WhenSubjectIsMissing()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();
            var grade = ValidGrade(studentId);
            grade.Subject = "   "; // blank

            // Act
            var result = controller.AddGrade(grade);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void AddGrade_ReturnsBadRequest_WhenSemesterIsMissing()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();
            var grade = ValidGrade(studentId);
            grade.Semester = "";

            // Act
            var result = controller.AddGrade(grade);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void AddGrade_ReturnsBadRequest_WhenScoreExceedsMaxScore()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();
            var grade = ValidGrade(studentId);
            grade.Score = 120;
            grade.MaxScore = 100;

            // Act
            var result = controller.AddGrade(grade);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void AddGrade_ReturnsBadRequest_WhenScoreIsNegative()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();
            var grade = ValidGrade(studentId);
            grade.Score = -5;

            // Act
            var result = controller.AddGrade(grade);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ══════════════════════════════════════════════
        //  UPDATE (PUT)
        // ══════════════════════════════════════════════

        [Fact]
        public void UpdateGrade_ReturnsNoContent_AndUpdatesGrade()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var existing = ValidGrade(studentId);
            context.Grades.Add(existing);
            context.SaveChanges();

            var updated = new Grade
            {
                Id        = existing.Id,
                StudentId = studentId,
                Subject   = "Updated Subject",
                Score     = 95,
                MaxScore  = 100,
                GradeType = GradeType.FinalExam,
                Semester  = "2024-S2",
                Comments  = "Excellent",
                Date      = DateTime.UtcNow
            };

            // Act
            var result = controller.UpdateGrade(existing.Id, updated);

            // Assert
            Assert.IsType<NoContentResult>(result);
            var persisted = context.Grades.Find(existing.Id)!;
            Assert.Equal("Updated Subject", persisted.Subject);
            Assert.Equal(95, persisted.Score);
            Assert.Equal(GradeType.FinalExam, persisted.GradeType);
        }

        [Fact]
        public void UpdateGrade_ReturnsNotFound_WhenGradeDoesNotExist()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();
            var updated = ValidGrade(studentId);
            updated.Id = 9999;

            // Act
            var result = controller.UpdateGrade(9999, updated);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        // ══════════════════════════════════════════════
        //  DELETE
        // ══════════════════════════════════════════════

        [Fact]
        public void DeleteGrade_ReturnsNoContent_AndRemovesGrade()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var grade = ValidGrade(studentId);
            context.Grades.Add(grade);
            context.SaveChanges();

            // Act
            var result = controller.DeleteGrade(grade.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, context.Grades.Count());
        }

        [Fact]
        public void DeleteGrade_ReturnsNotFound_WhenGradeDoesNotExist()
        {
            // Arrange
            var (controller, _, _) = CreateController();

            // Act
            var result = controller.DeleteGrade(9999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        // ══════════════════════════════════════════════
        //  FILTERING / SEARCH (integration-style via GetGrades)
        // ══════════════════════════════════════════════

        [Fact]
        public void GetGrades_FiltersByStudentId_ReturnsCorrectSubset()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();

            context.Grades.AddRange(
                new Grade { StudentId = studentId, Subject = "Math",    Score = 80, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S1", Comments = "", Date = DateTime.UtcNow },
                new Grade { StudentId = studentId, Subject = "Biology", Score = 75, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S2", Comments = "", Date = DateTime.UtcNow }
            );
            context.SaveChanges();

            // Act
            var result = controller.GetGrades(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value).ToList();
            Assert.Equal(2, grades.Count);
            Assert.All(grades, g => Assert.Equal(studentId, g.StudentId));
        }

        [Fact]
        public void GetGrades_ReturnsEmpty_WhenStudentHasNoGrades()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();

            // Act
            var result = controller.GetGrades(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value);
            Assert.Empty(grades);
        }
    }
}
