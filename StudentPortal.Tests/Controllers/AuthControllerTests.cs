using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using StudentPortal.API.Controllers;
using StudentPortal.API.Models;
using StudentPortal.Tests.Helpers;

namespace StudentPortal.Tests.Controllers
{
    /// <summary>
    /// Unit tests for AuthController (Register and Login).
    /// Each test uses an isolated in-memory database (Arrange-Act-Assert pattern).
    /// </summary>
    public class AuthControllerTests
    {
        // ─────────────────────────────────────────────
        //  Helper factory
        // ─────────────────────────────────────────────
        private static AuthController CreateController(API.Data.AppDbContext? context = null)
        {
            context ??= TestDbContextFactory.Create();

            var inMemoryConfig = new Dictionary<string, string?>
            {
                ["Jwt:Key"]      = "super_secret_test_key_that_is_long_enough_32chars",
                ["Jwt:Issuer"]   = "StudentPortalTest",
                ["Jwt:Audience"] = "StudentPortalTestAudience"
            };

            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(inMemoryConfig)
                .Build();

            return new AuthController(context, config);
        }

        private static User ValidUser(string email = "user@test.com") => new User
        {
            Name         = "Test User",
            Email        = email,
            PasswordHash = "plaintextpassword",
            Role         = "Student"
        };

        // ══════════════════════════════════════════════
        //  REGISTER
        // ══════════════════════════════════════════════

        [Fact]
        public async Task Register_ReturnsOk_WhenUserDataIsValid()
        {
            // Arrange
            var controller = CreateController();
            var user = ValidUser();

            // Act
            var result = await controller.Register(user);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task Register_PersistsUser_WithHashedPassword()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);
            var user = ValidUser("hash@test.com");
            var plainPassword = user.PasswordHash;

            // Act
            await controller.Register(user);

            // Assert
            var saved = context.Users.Single(u => u.Email == "hash@test.com");
            Assert.NotEqual(plainPassword, saved.PasswordHash); // stored as hash, not plain text
            Assert.True(BCrypt.Net.BCrypt.Verify(plainPassword, saved.PasswordHash));
        }

        [Fact]
        public async Task Register_CreatesStudentRecord_WhenRoleIsStudent()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);
            var user = ValidUser("student@test.com");
            user.Role = "Student";

            // Act
            await controller.Register(user);

            // Assert – a corresponding Student row must exist
            var savedUser = context.Users.Single(u => u.Email == "student@test.com");
            Assert.True(context.Students.Any(s => s.UserId == savedUser.Id));
        }

        [Fact]
        public async Task Register_DoesNotCreateStudentRecord_WhenRoleIsTeacher()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);
            var user = ValidUser("teacher@test.com");
            user.Role = "Teacher";

            // Act
            await controller.Register(user);

            // Assert
            Assert.Equal(0, context.Students.Count());
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenEmailAlreadyExists()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);
            var user1 = ValidUser("dup@test.com");
            await controller.Register(user1);

            var user2 = ValidUser("dup@test.com"); // same email

            // Act
            var result = await controller.Register(user2);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenPasswordIsEmpty()
        {
            // Arrange
            var controller = CreateController();
            var user = ValidUser("empty@test.com");
            user.PasswordHash = "   "; // blank password

            // Act
            var result = await controller.Register(user);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        // ══════════════════════════════════════════════
        //  LOGIN
        // ══════════════════════════════════════════════

        [Fact]
        public async Task Login_ReturnsOk_WithToken_WhenCredentialsAreValid()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);

            var user = ValidUser("login@test.com");
            var plainPassword = user.PasswordHash;
            await controller.Register(user);

            var request = new AuthRequest { Email = "login@test.com", Password = plainPassword };

            // Act
            var result = await controller.Login(request);

            // Assert
            var ok = Assert.IsType<OkObjectResult>(result);
            // Response should have a token property
            var value = ok.Value;
            Assert.NotNull(value);
            var token = value!.GetType().GetProperty("token")?.GetValue(value)?.ToString();
            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenEmailDoesNotExist()
        {
            // Arrange
            var controller = CreateController();
            var request = new AuthRequest { Email = "nonexistent@test.com", Password = "password" };

            // Act
            var result = await controller.Login(request);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIsWrong()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);

            var user = ValidUser("wrongpwd@test.com");
            await controller.Register(user);

            var request = new AuthRequest { Email = "wrongpwd@test.com", Password = "WrongPassword!" };

            // Act
            var result = await controller.Login(request);

            // Assert
            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        [Fact]
        public async Task Login_GeneratesDifferentTokens_ForDifferentLogins()
        {
            // Arrange
            var context = TestDbContextFactory.Create();
            var controller = CreateController(context);

            var user = ValidUser("tokens@test.com");
            var plain = user.PasswordHash;
            await controller.Register(user);

            var request = new AuthRequest { Email = "tokens@test.com", Password = plain };

            // Act
            var r1 = (OkObjectResult)(await controller.Login(request));
            await Task.Delay(1100); // ensure iat differs (JWT has 1-second resolution)
            var r2 = (OkObjectResult)(await controller.Login(request));

            // Assert
            var t1 = r1.Value!.GetType().GetProperty("token")!.GetValue(r1.Value)!.ToString();
            var t2 = r2.Value!.GetType().GetProperty("token")!.GetValue(r2.Value)!.ToString();
            Assert.NotEqual(t1, t2);
        }
    }
}
