namespace backend.Services.Interfaces
{
    public interface IImageUploadService
    {
        Task<string> SaveFishFarmImageAsync(IFormFile file);
        void DeleteFishFarmImage(string fileName);
        Task<string> SaveEmployeeImageAsync(IFormFile file);
        void DeleteEmployeeImage(string fileName);
    }
}
