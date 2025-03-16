using Microsoft.EntityFrameworkCore;
using StudentPortal.API.Models;
//Database context, acting as a bridge between backend and DB.
//This allows us to interact with db tables using objects insteas
//of SQL queires.
namespace StudentPortal.API.Data
{
    public class AppDbContext : DbContext //Inherits from EF Core.
    {
        //DbSet represents a table in the DB
        public DbSet<Student> Students { get; set; }
        public DbSet<Grade> Grades { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Schedule> Schedules { get; set; }

        //Constructor. DBContextOptions tells EF Core which db to use
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        //options - object, which contains db configuration
        //base(options) calls DbContext constructor (parent, base class) and gives it the config

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Define one-to-one relationship between Student and User
            modelBuilder.Entity<Student>()
                .HasOne(s => s.User)
                .WithOne(u => u.Student)
                .HasForeignKey<Student>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade); // Delete student if user is deleted

            // Configure Grade-Student relationship
            modelBuilder.Entity<Grade>()
                .HasOne(g => g.Student)
                .WithMany(s => s.Grades)
                .HasForeignKey(g => g.StudentId)
                .IsRequired();

            base.OnModelCreating(modelBuilder);
        }
    }
}
