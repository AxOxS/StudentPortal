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

        // GET: api/users - Get all users (Admin only)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role
                })
                .ToListAsync();

            return Ok(users);
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

            // Update name if provided
            if (!string.IsNullOrEmpty(request.Name))
            {
                user.Name = request.Name;
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

            // Update role if provided (Admin only)
            if (!string.IsNullOrEmpty(request.Role))
            {
                user.Role = request.Role;
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

        // DELETE: api/users/{id} - Delete a user (Admin only)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            // Optional: Prevent deleting the last admin
            if (user.Role == "Admin")
            {
                var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
                if (adminCount <= 1)
                {
                    return BadRequest("Cannot delete the last admin user");
                }
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private async Task<bool> UserExists(int id)
        {
            return await _context.Users.AnyAsync(e => e.Id == id);
        }
    }

    public class UpdateUserRequest
    {
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
} 