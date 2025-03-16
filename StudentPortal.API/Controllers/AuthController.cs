using Microsoft.AspNetCore.Mvc; //Handles api requests
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims; //Handles users identity in JWT
using System.Text;
using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Data;
using StudentPortal.API.Models;
using BCrypt.Net; //Used for password hashing and verification

//Handles user auth (registration n login) using jwt tokens and password hashing

namespace StudentPortal.API.Controllers
{
    [Route("api/auth")] //All endpoints for this controller are accessible under /api/auth
    [ApiController] //Auth request validation
    public class AuthController : ControllerBase
    {
        //Constructor
        //AppDbContext injects the DB context for accessing the Users table
        //Iconfiguration reads jwt secret keys from appsettings.json
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        //NEW USER REGISTRATION
        [HttpPost("register")]
        public async Task<IActionResult> Register(User user)
        {
            if (_context.Users.Any(u => u.Email == user.Email))
            {
                return BadRequest("Email already exists.");
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash); //Hashes the password for security

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // If the user is a student, add them to the Students table
            if (user.Role.ToLower() == "student")
            {
                var student = new Student
                {
                    UserId = user.Id
                };

                _context.Students.Add(student);
                await _context.SaveChangesAsync(); // Save student entry
            }

            return Ok(new { message = "User registered successfully" });
        }

        //LOGIN n GET JWT TOKEN
        //Use HMAC SHA-256 encryption for token signing
        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim("role", user.Role.ToString()),
                new Claim("id", user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        //Finds the user by email in the DB and compares the stored hashed password. If matches - generates a jwt token and returns it.
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email or password.");
            }

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized("Invalid email or password.");
            }

            var token = GenerateJwtToken(user);
            return Ok(new { token });
        }

    }
}
