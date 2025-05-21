using Microsoft.AspNetCore.Mvc; //Enables API controllers n routing
using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Data;
using StudentPortal.API.Models;
using Microsoft.AspNetCore.Authorization; //Enables auth

//Responsible for handling HTTP requests related to students.

namespace StudentPortal.API.Controllers
{
    //We define the API endpoint path, enable aut request validation n binding and require JWT token to access this endpoint
    [Route("api/students")] 
    [ApiController]
    [Authorize]
    public class StudentController : ControllerBase //Provides base func for REST API
    {
        //Constructor that injects an instance of AppDbContext into StudentController class

        private readonly AppDbContext _context; //Ensure _context is set once and cannot be modified later on

        public StudentController(AppDbContext context) //Use dependency injection to provide AppDbContext (configured in program.cs)
        {
            _context = context; //Store the injected context for the future (CRUD operations)
        }

        //Retrieve all students with their user information
        [HttpGet]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _context.Students
                .Include(s => s.User)  // Include User information
                .Include(s => s.Grades)
                .Select(s => new {
                    s.Id,
                    s.UserId,
                    FirstName = s.User.Name.Split(' ')[0],  // Get first name from User's Name
                    LastName = s.User.Name.Split(' ').Length > 1 ? s.User.Name.Split(' ')[1] : "",  // Get last name if exists
                    Email = s.User.Email,
                    s.User.Role,
                    GradeAverage = s.Grades.Any() ? Math.Round(s.Grades.Average(g => g.Score), 2) : null,
                    s.Grades
                })
                .ToListAsync();

            return Ok(students);
        }

        //Add new students Post /api/students
        [HttpPost]
        public async Task<IActionResult> AddStudent(Student student)
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetStudents), new { id = student.Id }, student);
            //Returns 201 created with newly added students, nameof(GetStudents) references the GetStudents method
        }
    }
}

//So far we handle GET POST requests.
//use AppDbContext for DB operations.
//Secure the endpoint with Authorize,
//and implement CreatedAtAction for RESTful API standards.