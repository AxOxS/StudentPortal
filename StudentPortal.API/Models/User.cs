using System.ComponentModel.DataAnnotations; //Allows to set data annotations, to set validation rules for the db model
using System.Text.Json.Serialization; //Enables JsonIgnore attribute to hide sensitive fields from API responses

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

        // Note: PasswordHash should never be sent to clients
        // Controllers must explicitly exclude it from responses using Select() or anonymous objects
        [Required]
        public string PasswordHash { get; set; }

        [Required]
        public string Role { get; set; }

        // Navigation property
        public Student? Student { get; set; }
    }
}
