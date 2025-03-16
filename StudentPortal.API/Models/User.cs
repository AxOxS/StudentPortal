using System.ComponentModel.DataAnnotations; //Allows to set data annotations, to set validation rules for the db model

namespace StudentPortal.API.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; }

        // Navigation property
        public Student? Student { get; set; }
    }
}
