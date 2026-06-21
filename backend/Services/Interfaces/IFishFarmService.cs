using backend.Models.DTOs.FishFarm;

namespace backend.Services.Interfaces
{
    public interface IFishFarmService
    {
        Task<PagedResultDto<FishFarmResponseDto>> GetAllAsync(FishFarmQueryDto query);
        Task<FishFarmResponseDto?> GetByIdAsync(Guid id);
        Task<FishFarmResponseDto> CreateAsync(FishFarmCreateDto dto);
        Task<bool> UpdateAsync(Guid id, FishFarmUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<List<EmployeeByFishFarmResponseDto>> GetByFishFarmIdAsync(Guid fishFarmId);

    }
}
