using backend.Models.DTOs.Employee;
using backend.Models.DTOs.FishFarm;

namespace backend.Services.Interfaces
{
    public interface IEmployeeService
    {
        Task<PagedResultDto<EmployeeResponseDto>> GetAllAsync(EmployeeQueryDto query);
        Task<EmployeeResponseDto?> GetByIdAsync(Guid id);
        Task<EmployeeResponseDto> CreateAsync(EmployeeCreateDto dto);
        Task<bool> UpdateAsync(Guid id, EmployeeUpdateDto dto);
        Task<bool> DeleteAsync(Guid id);
    }
}
