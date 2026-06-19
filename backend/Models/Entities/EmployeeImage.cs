namespace backend.Models.Entities
{
    public class EmployeeImage
    {
        public Guid Id { get; set; }
        public Guid EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public required string ImageName { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}
