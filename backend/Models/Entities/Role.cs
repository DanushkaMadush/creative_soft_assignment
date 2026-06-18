namespace backend.Models.Entities
{
    public class Role
    {
        public Guid Id { get; set; }
        public required string Name { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public required string CreatedBy { get; set; }
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
