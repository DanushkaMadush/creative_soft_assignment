namespace backend.Services.Interfaces
{
    public interface IImageUploadService
    {
        Task<string> SaveFishFarmImageAsync(IFormFile file);
        void DeleteFishFarmImage(string fileName);
    }
}
