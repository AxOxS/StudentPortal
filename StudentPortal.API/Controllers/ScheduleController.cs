using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;
using StudentPortal.API.Data;
using StudentPortal.API.Models;

namespace StudentPortal.API.Controllers
{
    [Route("api/schedule")]
    [ApiController]
    public class ScheduleController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ScheduleController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("{studentId}")]
        public IActionResult GetSchedule(int studentId)
        {
            var schedule = _context.Schedules.Where(s => s.StudentId == studentId).ToList();
            return Ok(schedule);
        }

        [HttpPost]
        public IActionResult AddSchedule([FromBody] Schedule schedule)
        {
            try
            {
                // Check for validation errors already present
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Find the student entity to properly link it
                var student = _context.Students.Find(schedule.StudentId);
                if (student == null)
                {
                    return BadRequest(new { error = "Student not found" });
                }

                // Detach all entities to avoid tracking issues
                _context.ChangeTracker.Clear();

                // Create a new schedule without the navigation property
                var newSchedule = new Schedule
                {
                    StudentId = schedule.StudentId,
                    Subject = schedule.Subject,
                    StartTime = schedule.StartTime,
                    EndTime = schedule.EndTime,
                    DayOfWeek = schedule.DayOfWeek,
                    Room = schedule.Room,
                    Semester = schedule.Semester,
                    IsActive = schedule.IsActive
                };
                
                _context.Schedules.Add(newSchedule);
                _context.SaveChanges();
                
                // Return a simplified response without navigation properties
                return CreatedAtAction(nameof(GetSchedule), new { studentId = newSchedule.StudentId }, new
                {
                    newSchedule.Id,
                    newSchedule.StudentId,
                    newSchedule.Subject,
                    newSchedule.StartTime,
                    newSchedule.EndTime,
                    newSchedule.DayOfWeek,
                    newSchedule.Room,
                    newSchedule.Semester,
                    newSchedule.IsActive
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message, innerException = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateSchedule(int id, [FromBody] Schedule schedule)
        {
            if (id != schedule.Id)
            {
                return BadRequest();
            }

            var existingSchedule = _context.Schedules.Find(id);
            if (existingSchedule == null)
            {
                return NotFound();
            }

            // Find the student to validate it exists
            var student = _context.Students.Find(schedule.StudentId);
            if (student == null)
            {
                return BadRequest("Student not found");
            }

            // Update properties directly
            existingSchedule.Subject = schedule.Subject;
            existingSchedule.StartTime = schedule.StartTime;
            existingSchedule.EndTime = schedule.EndTime;
            existingSchedule.DayOfWeek = schedule.DayOfWeek;
            existingSchedule.Room = schedule.Room;
            existingSchedule.Semester = schedule.Semester;
            existingSchedule.IsActive = schedule.IsActive;
            
            // Explicitly set StudentId but don't use navigation property
            existingSchedule.StudentId = schedule.StudentId;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteSchedule(int id)
        {
            var schedule = _context.Schedules.Find(id);
            if (schedule == null)
            {
                return NotFound();
            }

            _context.Schedules.Remove(schedule);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
