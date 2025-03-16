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

        //Retrieve all students, handle GET /api/students
        [HttpGet]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _context.Students.Include(s => s.Grades).ToListAsync(); //Fetches all the students from the DB and use include to load related grades.
            return Ok(students); //returns 200ok with the data
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