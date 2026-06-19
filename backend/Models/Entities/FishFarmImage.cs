namespace backend.Models.Entities
{
    public class FishFarmImage
    {
        public Guid Id { get; set; }
        public Guid FishFarmId { get; set; }
        public FishFarm FishFarm { get; set; } = null!;
        public required string ImageName { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
