using backend.Models.DTOs.Dashboard;

namespace backend.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<DashboardCountDto> GetTotalFishFarmsAsync();
        Task<DashboardCountDto> GetTotalEmployeesAsync();
        Task<List<FishFarmLocationDto>> GetFishFarmLocationsAsync();
    }
}
