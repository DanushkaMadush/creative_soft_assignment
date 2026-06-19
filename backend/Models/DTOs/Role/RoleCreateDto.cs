using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.Role
{
    public class RoleCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
    }
}
