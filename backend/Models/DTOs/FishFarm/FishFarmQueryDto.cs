namespace backend.Models.DTOs.FishFarm
{
    public class FishFarmQueryDto
    {
        public string? SearchTerm { get; set; }
        public bool? HasBarge { get; set; }
        public bool IsActive { get; set; } = true;

        public int PageNumber { get; set; } = 1;

        private int _pageSize = 10;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > 50 ? 50 : value;
        }
    }
}
