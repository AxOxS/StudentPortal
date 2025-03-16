using System.ComponentModel.DataAnnotations;

namespace StudentPortal.API.Models
{
    public enum GradeType
    {
        Homework,
        Quiz,
        Exam,
        Project,
        Participation,
        FinalExam
    }

    public class Grade
    {
        //Primary key for each grade record
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Subject { get; set; }

        [Required]
        [Range(0, 100)]
        public double Score { get; set; }

        [Required]
        [Range(0, 100)]
        public double MaxScore { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public GradeType GradeType { get; set; }

        [Required]
        [StringLength(20)]
        public string Semester { get; set; }

        [StringLength(500)]
        public string Comments { get; set; }

        //Foreign key, many grades, one student
        public int StudentId { get; set; }
        
        [System.ComponentModel.DataAnnotations.Schema.ForeignKey("StudentId")]
        public virtual Student? Student { get; set; }
        //Object refference to a student for easy access.
        //Creates relationships between tables when migrating
    }
}
