namespace backend.Models.Entities
{
    public class Employee
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Email { get; set; }
        public int Age { get; set; }
        public DateOnly CertifiedUntil { get; set; }       
        public Guid FishFarmId { get; set; }
        public FishFarm FishFarm { get; set; } = null!;
        public Guid RoleId { get; set; }
        public Role Role { get; set; } = null!;
        public ICollection<EmployeeImage> Images { get; set; } = new List<EmployeeImage>();
    }
}
