namespace backend.Models.DTOs.FishFarm
{
    public class EmployeeByFishFarmResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public DateOnly? CertifiedUntil { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
    }
}
