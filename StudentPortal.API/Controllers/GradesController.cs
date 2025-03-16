using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Collections.Generic;
using StudentPortal.API.Data;
using StudentPortal.API.Models;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace StudentPortal.API.Controllers
{
    [Route("api/grades")]
    [ApiController]
    [Authorize]
    public class GradesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<GradesController> _logger;

        public GradesController(AppDbContext context, ILogger<GradesController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{studentId}")]
        public IActionResult GetGrades(int studentId)
        {
            var grades = _context.Grades.Where(g => g.StudentId == studentId).ToList();
            return Ok(grades);
        }

        [HttpPost]
        public IActionResult AddGrade([FromBody] Grade grade)
        {
            try
            {
                _logger.LogInformation($"Received grade data: {JsonSerializer.Serialize(grade)}");

                if (!ModelState.IsValid)
                {
                    var errors = string.Join("; ", ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage));
                    _logger.LogError($"Invalid grade model: {errors}");
                    return BadRequest(new { message = errors });
                }

                // Validate required fields
                if (grade == null)
                {
                    var message = "Grade data is required";
                    _logger.LogError(message);
                    return BadRequest(new { message });
                }

                // Log all received data for debugging
                _logger.LogInformation("Validating grade data with details:");
                _logger.LogInformation($"StudentId: {grade.StudentId}");
                _logger.LogInformation($"Subject: {grade.Subject ?? "null"}");
                _logger.LogInformation($"Score: {grade.Score}");
                _logger.LogInformation($"MaxScore: {grade.MaxScore}");
                _logger.LogInformation($"GradeType: {grade.GradeType} (as int: {(int)grade.GradeType})");
                _logger.LogInformation($"Semester: {grade.Semester ?? "null"}");
                _logger.LogInformation($"Comments: {grade.Comments ?? "null"}");
                _logger.LogInformation($"Date: {grade.Date}");

                // Verify the student exists
                var student = _context.Students.Find(grade.StudentId);
                if (student == null)
                {
                    var message = $"Student with ID {grade.StudentId} not found";
                    _logger.LogError(message);
                    return BadRequest(new { message });
                }

                // Create a new grade without the Student navigation property
                var newGrade = new Grade
                {
                    StudentId = grade.StudentId,
                    Subject = grade.Subject,
                    Score = grade.Score,
                    MaxScore = grade.MaxScore,
                    GradeType = grade.GradeType,
                    Semester = grade.Semester,
                    Comments = grade.Comments ?? "",
                    Date = grade.Date == default ? DateTime.UtcNow : grade.Date
                };

                // Validate grade data
                if (newGrade.Score < 0 || newGrade.Score > newGrade.MaxScore)
                {
                    var message = $"Invalid score: {newGrade.Score}. Score must be between 0 and {newGrade.MaxScore}";
                    _logger.LogError(message);
                    return BadRequest(new { message });
                }

                if (string.IsNullOrWhiteSpace(newGrade.Subject))
                {
                    var message = "Subject is required";
                    _logger.LogError(message);
                    return BadRequest(new { message });
                }

                if (string.IsNullOrWhiteSpace(newGrade.Semester))
                {
                    var message = "Semester is required";
                    _logger.LogError(message);
                    return BadRequest(new { message });
                }

                // Validate GradeType enum
                if (!Enum.IsDefined(typeof(GradeType), newGrade.GradeType))
                {
                    var message = $"Invalid grade type: {newGrade.GradeType}. Must be one of: {string.Join(", ", Enum.GetNames(typeof(GradeType)))}";
                    _logger.LogError(message);
                    return BadRequest(new { message });
                }

                // Log the grade data being added
                _logger.LogInformation($"Adding grade: Subject={newGrade.Subject}, Score={newGrade.Score}, MaxScore={newGrade.MaxScore}, " +
                    $"GradeType={newGrade.GradeType}, Semester={newGrade.Semester}, StudentId={newGrade.StudentId}");

                _context.Grades.Add(newGrade);
                _context.SaveChanges();

                // Create a simplified response object without navigation properties
                var response = new
                {
                    newGrade.Id,
                    newGrade.StudentId,
                    newGrade.Subject,
                    newGrade.Score,
                    newGrade.MaxScore,
                    newGrade.GradeType,
                    newGrade.Semester,
                    newGrade.Comments,
                    newGrade.Date
                };

                return CreatedAtAction(nameof(GetGrades), new { studentId = newGrade.StudentId }, response);
            }
            catch (Exception ex)
            {
                var message = $"Error adding grade: {ex.Message}";
                _logger.LogError(message);
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message });
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateGrade(int id, [FromBody] Grade updatedGrade)
        {
            try
            {
                var grade = _context.Grades.Find(id);
                if (grade == null)
                {
                    return NotFound();
                }

                grade.Subject = updatedGrade.Subject;
                grade.Score = updatedGrade.Score;
                grade.MaxScore = updatedGrade.MaxScore;
                grade.GradeType = updatedGrade.GradeType;
                grade.Semester = updatedGrade.Semester;
                grade.Comments = updatedGrade.Comments ?? "";
                grade.Date = updatedGrade.Date;

                _context.SaveChanges();
                return NoContent();
            }
            catch (Exception ex)
            {
                var message = $"Error updating grade: {ex.Message}";
                _logger.LogError(message);
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteGrade(int id)
        {
            try
            {
                var grade = _context.Grades.Find(id);
                if (grade == null)
                {
                    return NotFound();
                }

                _context.Grades.Remove(grade);
                _context.SaveChanges();
                return NoContent();
            }
            catch (Exception ex)
            {
                var message = $"Error deleting grade: {ex.Message}";
                _logger.LogError(message);
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message });
            }
        }
    }
}
