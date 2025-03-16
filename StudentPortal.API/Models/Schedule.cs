using System.ComponentModel.DataAnnotations;

namespace StudentPortal.API.Models
{
    public class Schedule
    {
        public int Id { get; set; }

        public int StudentId { get; set; }
        public Student Student { get; set; }

        [Required]
        [StringLength(100)]
        public string Subject { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [Required]
        public DayOfWeek DayOfWeek { get; set; }

        [Required]
        [StringLength(50)]
        public string Room { get; set; }

        [Required]
        [StringLength(20)]
        public string Semester { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
