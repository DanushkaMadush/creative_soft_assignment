namespace backend.Models.Entities
{
    public class FishFarm
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public int NumberOfCages { get; set; }
        public bool HasBarge { get; set; } = false;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public required string CreatedBy { get; set; }
        public DateTime? UpdatedAt { get; set; } = null;
        public string? UpdatedBy { get; set; } = null;
        public ICollection<FishFarmImage> Images { get; set; } = new List<FishFarmImage>();
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
