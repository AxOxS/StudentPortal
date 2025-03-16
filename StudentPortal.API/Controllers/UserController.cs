using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Data;
using StudentPortal.API.Models;
using BCrypt.Net;

namespace StudentPortal.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound();
            }

            // Only return non-sensitive information
            return new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role
            };
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserRequest request)
        {
            // Get the current user
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Update email if provided
            if (!string.IsNullOrEmpty(request.Email))
            {
                // Check if email is already taken by another user
                var emailExists = await _context.Users
                    .AnyAsync(u => u.Email == request.Email && u.Id != id);
                if (emailExists)
                {
                    return BadRequest("Email is already in use");
                }
                user.Email = request.Email;
            }

            // Update password if provided
            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                // Verify current password
                if (string.IsNullOrEmpty(request.CurrentPassword))
                {
                    return BadRequest("Current password is required to change password");
                }

                bool isCurrentPasswordValid = BCrypt.Net.BCrypt.Verify(
                    request.CurrentPassword, user.PasswordHash);

                if (!isCurrentPasswordValid)
                {
                    return BadRequest("Current password is incorrect");
                }

                // Hash and set new password
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await UserExists(id))
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        private async Task<bool> UserExists(int id)
        {
            return await _context.Users.AnyAsync(e => e.Id == id);
        }
    }

    public class UpdateUserRequest
    {
        public string? Email { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
} 