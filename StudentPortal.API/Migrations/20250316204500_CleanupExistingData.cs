using Microsoft.EntityFrameworkCore.Migrations;

namespace StudentPortal.API.Migrations
{
    public partial class CleanupExistingData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Remove existing schedules
            migrationBuilder.Sql("DELETE FROM Schedules");
            
            // Remove existing grades
            migrationBuilder.Sql("DELETE FROM Grades");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Cannot restore deleted data
        }
    }
} 