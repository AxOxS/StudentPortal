using Microsoft.AspNetCore.Mvc;
using StudentPortal.API.Controllers;
using StudentPortal.API.Models;
using StudentPortal.Tests.Helpers;

namespace StudentPortal.Tests.Controllers
{
    /// <summary>
    /// Unit tests for ScheduleController.
    /// Each test uses an isolated in-memory database (Arrange-Act-Assert pattern).
    /// </summary>
    public class ScheduleControllerTests
    {
        // ─────────────────────────────────────────────
        //  Helper factories
        // ─────────────────────────────────────────────
        private static (ScheduleController controller, API.Data.AppDbContext context, int studentId) CreateController()
        {
            var context = TestDbContextFactory.Create();

            var user = new User { Name = "Test User", Email = "sched@test.com", PasswordHash = "hash", Role = "Student" };
            context.Users.Add(user);
            context.SaveChanges();

            var student = new Student { UserId = user.Id, Grades = new List<Grade>() };
            context.Students.Add(student);
            context.SaveChanges();

            return (new ScheduleController(context), context, student.Id);
        }

        private static Schedule ValidSchedule(int studentId) => new Schedule
        {
            StudentId  = studentId,
            Subject    = "Mathematics",
            StartTime  = new TimeSpan(8, 0, 0),
            EndTime    = new TimeSpan(9, 30, 0),
            DayOfWeek  = DayOfWeek.Monday,
            Room       = "101",
            Semester   = "2024-S1",
            IsActive   = true
        };

        // ══════════════════════════════════════════════
        //  GET
        // ══════════════════════════════════════════════

        [Fact]
        public void GetSchedule_ReturnsOk_WithAllSchedulesForStudent()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            context.Schedules.AddRange(
                new Schedule { StudentId = studentId, Subject = "Math",    StartTime = TimeSpan.FromHours(8), EndTime = TimeSpan.FromHours(9),  DayOfWeek = DayOfWeek.Monday,    Room = "101", Semester = "S1" },
                new Schedule { StudentId = studentId, Subject = "Physics", StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), DayOfWeek = DayOfWeek.Tuesday,  Room = "202", Semester = "S1" }
            );
            context.SaveChanges();

            // Act
            var result = controller.GetSchedule(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var schedules = Assert.IsAssignableFrom<IEnumerable<Schedule>>(ok.Value);
            Assert.Equal(2, schedules.Count());
        }

        [Fact]
        public void GetSchedule_ReturnsEmptyList_WhenNoneExist()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();

            // Act
            var result = controller.GetSchedule(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var schedules = Assert.IsAssignableFrom<IEnumerable<Schedule>>(ok.Value);
            Assert.Empty(schedules);
        }

        [Fact]
        public void GetSchedule_ReturnsOnlySchedulesForRequestedStudent()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();

            var user2 = new User { Name = "Other", Email = "other2@test.com", PasswordHash = "h", Role = "Student" };
            context.Users.Add(user2);
            context.SaveChanges();
            var student2 = new Student { UserId = user2.Id, Grades = new List<Grade>() };
            context.Students.Add(student2);
            context.SaveChanges();

            context.Schedules.AddRange(
                new Schedule { StudentId = studentId,   Subject = "Math",    StartTime = TimeSpan.FromHours(8), EndTime = TimeSpan.FromHours(9), DayOfWeek = DayOfWeek.Monday,  Room = "101", Semester = "S1" },
                new Schedule { StudentId = student2.Id, Subject = "History", StartTime = TimeSpan.FromHours(9), EndTime = TimeSpan.FromHours(10), DayOfWeek = DayOfWeek.Friday, Room = "303", Semester = "S1" }
            );
            context.SaveChanges();

            // Act
            var result = controller.GetSchedule(studentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var schedules = Assert.IsAssignableFrom<IEnumerable<Schedule>>(ok.Value).ToList();
            Assert.Single(schedules);
            Assert.Equal(studentId, schedules[0].StudentId);
        }

        // ══════════════════════════════════════════════
        //  ADD (POST)
        // ══════════════════════════════════════════════

        [Fact]
        public void AddSchedule_ReturnsCreated_AndPersistsSchedule()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var schedule = ValidSchedule(studentId);

            // Act
            var result = controller.AddSchedule(schedule);

            // Assert
            var created = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(1, context.Schedules.Count());
        }

        [Fact]
        public void AddSchedule_ReturnsBadRequest_WhenStudentDoesNotExist()
        {
            // Arrange
            var (controller, _, _) = CreateController();
            var schedule = ValidSchedule(studentId: 9999);

            // Act
            var result = controller.AddSchedule(schedule);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public void AddSchedule_PersistsCorrectFields()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var schedule = ValidSchedule(studentId);

            // Act
            controller.AddSchedule(schedule);

            // Assert
            var saved = context.Schedules.Single();
            Assert.Equal("Mathematics", saved.Subject);
            Assert.Equal("101", saved.Room);
            Assert.Equal(DayOfWeek.Monday, saved.DayOfWeek);
            Assert.True(saved.IsActive);
        }

        // ══════════════════════════════════════════════
        //  UPDATE (PUT)
        // ══════════════════════════════════════════════

        [Fact]
        public void UpdateSchedule_ReturnsNoContent_AndUpdatesFields()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var existing = ValidSchedule(studentId);
            context.Schedules.Add(existing);
            context.SaveChanges();

            var updated = new Schedule
            {
                Id        = existing.Id,
                StudentId = studentId,
                Subject   = "Updated Subject",
                StartTime = new TimeSpan(10, 0, 0),
                EndTime   = new TimeSpan(11, 30, 0),
                DayOfWeek = DayOfWeek.Wednesday,
                Room      = "999",
                Semester  = "2024-S2",
                IsActive  = false
            };

            // Act
            var result = controller.UpdateSchedule(existing.Id, updated);

            // Assert
            context.Entry(existing).Reload();
            Assert.IsType<NoContentResult>(result);
            Assert.Equal("Updated Subject", existing.Subject);
            Assert.Equal("999", existing.Room);
            Assert.False(existing.IsActive);
        }

        [Fact]
        public void UpdateSchedule_ReturnsNotFound_WhenScheduleDoesNotExist()
        {
            // Arrange
            var (controller, _, studentId) = CreateController();
            var updated = ValidSchedule(studentId);
            updated.Id = 9999;

            // Act
            var result = controller.UpdateSchedule(9999, updated);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void UpdateSchedule_ReturnsBadRequest_WhenIdMismatch()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var schedule = ValidSchedule(studentId);
            context.Schedules.Add(schedule);
            context.SaveChanges();

            var updated = ValidSchedule(studentId);
            updated.Id = schedule.Id + 100; // id mismatch

            // Act
            var result = controller.UpdateSchedule(schedule.Id, updated);

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        // ══════════════════════════════════════════════
        //  DELETE
        // ══════════════════════════════════════════════

        [Fact]
        public void DeleteSchedule_ReturnsNoContent_AndRemovesSchedule()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var schedule = ValidSchedule(studentId);
            context.Schedules.Add(schedule);
            context.SaveChanges();

            // Act
            var result = controller.DeleteSchedule(schedule.Id);

            // Assert
            Assert.IsType<NoContentResult>(result);
            Assert.Equal(0, context.Schedules.Count());
        }

        [Fact]
        public void DeleteSchedule_ReturnsNotFound_WhenScheduleDoesNotExist()
        {
            // Arrange
            var (controller, _, _) = CreateController();

            // Act
            var result = controller.DeleteSchedule(9999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void DeleteSchedule_DoesNotAffectOtherSchedules()
        {
            // Arrange
            var (controller, context, studentId) = CreateController();
            var s1 = ValidSchedule(studentId);
            var s2 = new Schedule { StudentId = studentId, Subject = "Physics", StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), DayOfWeek = DayOfWeek.Friday, Room = "202", Semester = "S1" };
            context.Schedules.AddRange(s1, s2);
            context.SaveChanges();

            // Act
            controller.DeleteSchedule(s1.Id);

            // Assert
            Assert.Equal(1, context.Schedules.Count());
            Assert.Equal(s2.Id, context.Schedules.Single().Id);
        }
    }
}
