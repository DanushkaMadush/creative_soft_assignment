using backend.Services.Interfaces;

namespace backend.Services.Implementations
{
    public class ImageUploadService : IImageUploadService
    {
        private readonly IWebHostEnvironment _environment;

        public ImageUploadService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        public async Task<string> SaveFishFarmImageAsync(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException("Invalid image type.");

            var fileName = $"{Guid.NewGuid()}{extension}";

            var folderPath = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                "fish_farms"
            );

            Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return fileName;
        }

        public void DeleteFishFarmImage(string fileName)
        {
            var filePath = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                "fish_farms",
                fileName
            );

            if (File.Exists(filePath))
                File.Delete(filePath);
        }

        public async Task<string> SaveEmployeeImageAsync(IFormFile file)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(extension))
                throw new InvalidOperationException("Invalid image type.");

            var fileName = $"{Guid.NewGuid()}{extension}";

            var folderPath = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                "employees"
            );

            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var filePath = Path.Combine(folderPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return fileName;
        }

        public void DeleteEmployeeImage(string fileName)
        {
            var filePath = Path.Combine(
                _environment.WebRootPath,
                "uploads",
                "employees",
                fileName
            );

            if (File.Exists(filePath))
                File.Delete(filePath);
        }
    }
}
