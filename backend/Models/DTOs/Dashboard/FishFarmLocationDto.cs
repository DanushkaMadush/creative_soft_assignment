namespace backend.Models.DTOs.Dashboard
{
    public class FishFarmLocationDto
    {
        public Guid FishFarmId { get; set; }
        public string FishFarmName { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }
}