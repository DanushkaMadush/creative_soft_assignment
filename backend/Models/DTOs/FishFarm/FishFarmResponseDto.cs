namespace backend.Models.DTOs.FishFarm
{
    public class FishFarmResponseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int NumberOfCages { get; set; }
        public bool HasBarge { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
    }
}
