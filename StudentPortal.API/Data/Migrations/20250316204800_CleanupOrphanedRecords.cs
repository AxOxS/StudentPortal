using Microsoft.EntityFrameworkCore.Migrations;

namespace StudentPortal.API.Data.Migrations
{
    public partial class CleanupOrphanedRecords : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop existing foreign key constraints if they exist
            migrationBuilder.Sql(@"
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Schedules_Students_StudentId')
                    ALTER TABLE Schedules DROP CONSTRAINT FK_Schedules_Students_StudentId;
                IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Grades_Students_StudentId')
                    ALTER TABLE Grades DROP CONSTRAINT FK_Grades_Students_StudentId;
            ");

            // Clean up orphaned records
            migrationBuilder.Sql(@"
                DELETE FROM Schedules WHERE StudentId NOT IN (SELECT Id FROM Students);
                DELETE FROM Grades WHERE StudentId NOT IN (SELECT Id FROM Students);
            ");

            // Re-create the foreign key constraints
            migrationBuilder.CreateIndex(
                name: "IX_Schedules_StudentId",
                table: "Schedules",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Grades_StudentId",
                table: "Grades",
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
            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Students_StudentId",
                table: "Schedules");

            migrationBuilder.DropForeignKey(
                name: "FK_Grades_Students_StudentId",
                table: "Grades");

            migrationBuilder.DropIndex(
                name: "IX_Schedules_StudentId",
                table: "Schedules");

            migrationBuilder.DropIndex(
                name: "IX_Grades_StudentId",
                table: "Grades");
        }
    }
} 