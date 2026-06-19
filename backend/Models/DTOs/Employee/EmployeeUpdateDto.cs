using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Employee
{
    public class EmployeeUpdateDto
    {
        [Required]
        public Guid FishFarmId { get; set; }

        [Required]
        public Guid RoleId { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Range(18, 100)]
        public int Age { get; set; }

        public DateOnly CertifiedUntil { get; set; }

        public IFormFile? Image { get; set; }
    }
}
