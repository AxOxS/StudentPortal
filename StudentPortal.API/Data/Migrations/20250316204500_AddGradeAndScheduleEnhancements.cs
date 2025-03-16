using Microsoft.EntityFrameworkCore.Migrations;

namespace StudentPortal.API.Data.Migrations
{
    public partial class AddGradeAndScheduleEnhancements : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, drop existing foreign key constraints
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Students_StudentId",
                table: "Schedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades");

            // Clean up orphaned records
            migrationBuilder.Sql(@"
                DELETE FROM Schedules WHERE StudentId NOT IN (SELECT Id FROM Students);
                DELETE FROM Grades WHERE StudentId NOT IN (SELECT Id FROM Students);
            ");

            // Drop existing Time column from Schedules
            migrationBuilder.DropColumn(
                name: "Time",
                table: "Schedules");

            // Modify Users table
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Users",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginAt",
                table: "Users",
                type: "datetime2",
                nullable: true);

            // Modify Schedules table
            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "Schedules",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Room",
                table: "Schedules",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "DayOfWeek",
                table: "Schedules",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "StartTime",
                table: "Schedules",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0));

            migrationBuilder.AddColumn<TimeSpan>(
                name: "EndTime",
                table: "Schedules",
                type: "time",
                nullable: false,
                defaultValue: new TimeSpan(0, 0, 0));

            migrationBuilder.AddColumn<string>(
                name: "Semester",
                table: "Schedules",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Schedules",
                type: "bit",
                nullable: false,
                defaultValue: false);

            // Modify Grades table
            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "Grades",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<string>(
                name: "Comments",
                table: "Grades",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "GradeType",
                table: "Grades",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<double>(
                name: "MaxScore",
                table: "Grades",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Semester",
                table: "Grades",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            // Re-create indexes and foreign keys
            migrationBuilder.CreateIndex(
                name: "IX_Schedules_StudentId",
                table: "Schedules",
                column: "StudentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Students_StudentId",
                table: "Schedules",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Drop foreign keys
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Students_StudentId",
                table: "Schedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades");

            // Drop columns from Users table
            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Users");

            // Drop columns from Schedules table
            migrationBuilder.DropColumn(
                name: "DayOfWeek",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "EndTime",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "Semester",
                table: "Schedules");

            migrationBuilder.DropColumn(
                name: "StartTime",
                table: "Schedules");

            // Drop columns from Grades table
            migrationBuilder.DropColumn(
                name: "Comments",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "GradeType",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "MaxScore",
                table: "Grades");

            migrationBuilder.DropColumn(
                name: "Semester",
                table: "Grades");

            // Restore original column types
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldType: "nvarchar(100)");

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                oldType: "nvarchar(255)");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "Schedules",
                type: "nvarchar(max)",
                nullable: false,
                oldType: "nvarchar(100)");

            migrationBuilder.AlterColumn<string>(
                name: "Room",
                table: "Schedules",
                type: "nvarchar(max)",
                nullable: false,
                oldType: "nvarchar(50)");

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "Grades",
                type: "nvarchar(max)",
                nullable: false,
                oldType: "nvarchar(100)");

            // Add back Time column to Schedules
            migrationBuilder.AddColumn<string>(
                name: "Time",
                table: "Schedules",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            // Re-add foreign keys
            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Students_StudentId",
                table: "Schedules",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades",
                column: "StudentId",
                principalTable: "Students",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
} 