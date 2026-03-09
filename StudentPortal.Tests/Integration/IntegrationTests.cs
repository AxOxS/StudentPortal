using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging.Abstractions;
using StudentPortal.API.Controllers;
using StudentPortal.API.Models;
using StudentPortal.Tests.Helpers;

namespace StudentPortal.Tests.Integration
{
    /// <summary>
    /// Integration-style tests that execute multiple controllers together against the
    /// same shared in-memory database – verifying end-to-end data flows without
    /// requiring a running HTTP server.
    ///
    /// Covers:
    ///   - Full report: all grades returned for a student
    ///   - Filtering grades by student
    ///   - Filtering schedules by student
    ///   - Schedule is searchable by DayOfWeek after insertion
    ///   - Grades remain after an unrelated schedule is deleted
    /// </summary>
    public class IntegrationTests
    {
        // ─────────────────────────────────────────────
        //  Shared setup helpers
        // ─────────────────────────────────────────────

        private record Setup(
            GradesController   GradesCtrl,
            ScheduleController ScheduleCtrl,
            API.Data.AppDbContext Context,
            int StudentId);

        private static Setup CreateSetup()
        {
            var context = TestDbContextFactory.Create();

            var user = new User { Name = "Integration User", Email = "integration@test.com", PasswordHash = "hash", Role = "Student" };
            context.Users.Add(user);
            context.SaveChanges();

            var student = new Student { UserId = user.Id, Grades = new List<Grade>() };
            context.Students.Add(student);
            context.SaveChanges();

            var gradesCtrl   = new GradesController(context, NullLogger<GradesController>.Instance);
            var scheduleCtrl = new ScheduleController(context);

            return new Setup(gradesCtrl, scheduleCtrl, context, student.Id);
        }

        // ══════════════════════════════════════════════
        //  Full report: all grades returned
        // ══════════════════════════════════════════════

        [Fact]
        public void GetGrades_ReturnsAllGrades_AfterMultipleInserts()
        {
            // Arrange
            var s = CreateSetup();

            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "Math",    Score = 80, MaxScore = 100, GradeType = GradeType.Exam,     Semester = "S1", Date = DateTime.UtcNow });
            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "Physics", Score = 70, MaxScore = 100, GradeType = GradeType.Homework, Semester = "S1", Date = DateTime.UtcNow });
            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "History", Score = 90, MaxScore = 100, GradeType = GradeType.Quiz,     Semester = "S2", Date = DateTime.UtcNow });

            // Act
            var result = s.GradesCtrl.GetGrades(s.StudentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value).ToList();
            Assert.Equal(3, grades.Count);
        }

        // ══════════════════════════════════════════════
        //  Filtering: correct student isolation
        // ══════════════════════════════════════════════

        [Fact]
        public void GetGrades_FiltersCorrectly_WhenMultipleStudentsExist()
        {
            // Arrange
            var s = CreateSetup();

            var user2 = new User { Name = "Second", Email = "sec@test.com", PasswordHash = "h", Role = "Student" };
            s.Context.Users.Add(user2);
            s.Context.SaveChanges();
            var student2 = new Student { UserId = user2.Id, Grades = new List<Grade>() };
            s.Context.Students.Add(student2);
            s.Context.SaveChanges();

            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId,   Subject = "Math",    Score = 80, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S1", Date = DateTime.UtcNow });
            s.GradesCtrl.AddGrade(new Grade { StudentId = student2.Id,   Subject = "Science", Score = 70, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S1", Date = DateTime.UtcNow });

            // Act
            var result = s.GradesCtrl.GetGrades(s.StudentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var grades = Assert.IsAssignableFrom<IEnumerable<Grade>>(ok.Value).ToList();
            Assert.Single(grades);
            Assert.Equal("Math", grades[0].Subject);
        }

        // ══════════════════════════════════════════════
        //  Schedule filtering
        // ══════════════════════════════════════════════

        [Fact]
        public void GetSchedule_ReturnsOnlyMatchingStudent_WhenMultipleStudentsExist()
        {
            // Arrange
            var s = CreateSetup();

            var user2 = new User { Name = "Other", Email = "other3@test.com", PasswordHash = "h", Role = "Student" };
            s.Context.Users.Add(user2);
            s.Context.SaveChanges();
            var student2 = new Student { UserId = user2.Id, Grades = new List<Grade>() };
            s.Context.Students.Add(student2);
            s.Context.SaveChanges();

            s.ScheduleCtrl.AddSchedule(new Schedule { StudentId = s.StudentId,  Subject = "Math",    StartTime = TimeSpan.FromHours(8),  EndTime = TimeSpan.FromHours(9),  DayOfWeek = DayOfWeek.Monday,  Room = "101", Semester = "S1" });
            s.ScheduleCtrl.AddSchedule(new Schedule { StudentId = student2.Id,  Subject = "History", StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), DayOfWeek = DayOfWeek.Tuesday, Room = "202", Semester = "S1" });

            // Act
            var result = s.ScheduleCtrl.GetSchedule(s.StudentId);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            var list = Assert.IsAssignableFrom<IEnumerable<Schedule>>(ok.Value).ToList();
            Assert.Single(list);
            Assert.Equal("Math", list[0].Subject);
        }

        // ══════════════════════════════════════════════
        //  Filtering by day-of-week (in-memory query)
        // ══════════════════════════════════════════════

        [Fact]
        public void Context_CanQuerySchedulesByDayOfWeek()
        {
            // Arrange
            var s = CreateSetup();
            s.ScheduleCtrl.AddSchedule(new Schedule { StudentId = s.StudentId, Subject = "Math",    StartTime = TimeSpan.FromHours(8),  EndTime = TimeSpan.FromHours(9),  DayOfWeek = DayOfWeek.Monday,    Room = "101", Semester = "S1" });
            s.ScheduleCtrl.AddSchedule(new Schedule { StudentId = s.StudentId, Subject = "Physics", StartTime = TimeSpan.FromHours(10), EndTime = TimeSpan.FromHours(11), DayOfWeek = DayOfWeek.Wednesday, Room = "202", Semester = "S1" });
            s.ScheduleCtrl.AddSchedule(new Schedule { StudentId = s.StudentId, Subject = "Art",     StartTime = TimeSpan.FromHours(12), EndTime = TimeSpan.FromHours(13), DayOfWeek = DayOfWeek.Monday,    Room = "303", Semester = "S1" });

            // Act – filter by day directly on context (simulates a search/filter scenario)
            var mondays = s.Context.Schedules
                .Where(sc => sc.StudentId == s.StudentId && sc.DayOfWeek == DayOfWeek.Monday)
                .ToList();

            // Assert
            Assert.Equal(2, mondays.Count);
            Assert.All(mondays, sc => Assert.Equal(DayOfWeek.Monday, sc.DayOfWeek));
        }

        // ══════════════════════════════════════════════
        //  Grades survive unrelated schedule deletion
        // ══════════════════════════════════════════════

        [Fact]
        public void DeleteSchedule_DoesNotAffectGrades()
        {
            // Arrange
            var s = CreateSetup();
            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "Math", Score = 90, MaxScore = 100, GradeType = GradeType.Exam, Semester = "S1", Date = DateTime.UtcNow });
            s.ScheduleCtrl.AddSchedule(new Schedule { StudentId = s.StudentId, Subject = "Math", StartTime = TimeSpan.FromHours(8), EndTime = TimeSpan.FromHours(9), DayOfWeek = DayOfWeek.Monday, Room = "101", Semester = "S1" });

            var schedule = s.Context.Schedules.First();

            // Act
            s.ScheduleCtrl.DeleteSchedule(schedule.Id);

            // Assert
            Assert.Equal(1, s.Context.Grades.Count(g => g.StudentId == s.StudentId));
        }

        // ══════════════════════════════════════════════
        //  Grade filtering by semester (search scenario)
        // ══════════════════════════════════════════════

        [Fact]
        public void Context_CanFilterGradesBySemester()
        {
            // Arrange
            var s = CreateSetup();
            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "Math",    Score = 80, MaxScore = 100, GradeType = GradeType.Exam, Semester = "2024-S1", Date = DateTime.UtcNow });
            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "Physics", Score = 70, MaxScore = 100, GradeType = GradeType.Exam, Semester = "2024-S2", Date = DateTime.UtcNow });
            s.GradesCtrl.AddGrade(new Grade { StudentId = s.StudentId, Subject = "Art",     Score = 95, MaxScore = 100, GradeType = GradeType.Exam, Semester = "2024-S1", Date = DateTime.UtcNow });

            // Act
            var s1Grades = s.Context.Grades
                .Where(g => g.StudentId == s.StudentId && g.Semester == "2024-S1")
                .ToList();

            // Assert
            Assert.Equal(2, s1Grades.Count);
            Assert.All(s1Grades, g => Assert.Equal("2024-S1", g.Semester));
        }

        // ══════════════════════════════════════════════
        //  Error handling: delete non-existent entities
        // ══════════════════════════════════════════════

        [Fact]
        public void DeleteGrade_ReturnsNotFound_ForNonExistentId()
        {
            // Arrange
            var s = CreateSetup();

            // Act
            var result = s.GradesCtrl.DeleteGrade(99999);

            // Assert – must not crash and must signal 404
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void DeleteSchedule_ReturnsNotFound_ForNonExistentId()
        {
            // Arrange
            var s = CreateSetup();

            // Act
            var result = s.ScheduleCtrl.DeleteSchedule(99999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }
    }
}
