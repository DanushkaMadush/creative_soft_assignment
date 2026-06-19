using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs.FishFarm
{
    public class FishFarmCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Range(-90, 90)]
        public decimal Latitude { get; set; }

        [Range(-180, 180)]
        public decimal Longitude { get; set; }

        [Range(1, int.MaxValue)]
        public int NumberOfCages { get; set; }

        public bool HasBarge { get; set; }

        [Required]
        public IFormFile Image { get; set; } = null!;
    }
}
