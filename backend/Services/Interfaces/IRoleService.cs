using backend.Models.DTOs.Role;

namespace backend.Services.Interfaces
{
    public interface IRoleService
    {
        Task<List<RoleResponseDto>> GetAllAsync();
        Task<RoleResponseDto> CreateAsync(RoleCreateDto dto);
    }
}
