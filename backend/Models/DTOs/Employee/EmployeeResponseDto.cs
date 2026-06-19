namespace backend.Models.DTOs.Employee
{
    public class EmployeeResponseDto
    {
        public Guid Id { get; set; }
        public Guid FishFarmId { get; set; }
        public string FishFarmName { get; set; } = string.Empty;
        public Guid RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Age { get; set; }
        public DateOnly CertifiedUntil { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
    }
}
