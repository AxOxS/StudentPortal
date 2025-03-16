using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StudentPortal.API.Models
{
    public class Student
    {
        // Primary key
        public int Id { get; set; }

        //One student - many grades. One to many
        public List<Grade> Grades { get; set; }

        //Foreign Key for student - user link
        public int UserId { get; set; }
        public User User { get; set; }
    }
}
