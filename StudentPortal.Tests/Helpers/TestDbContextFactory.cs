using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Data;

namespace StudentPortal.Tests.Helpers
{
    /// <summary>
    /// Creates a fresh in-memory AppDbContext for each test so tests remain isolated.
    /// </summary>
    public static class TestDbContextFactory
    {
        public static AppDbContext Create(string? dbName = null)
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(dbName ?? Guid.NewGuid().ToString())
                .Options;

            var context = new AppDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }
    }
}
