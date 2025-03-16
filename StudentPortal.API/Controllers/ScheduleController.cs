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
            _context.Schedules.Add(schedule);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetSchedule), new { studentId = schedule.StudentId }, schedule);
        }
    }
}
