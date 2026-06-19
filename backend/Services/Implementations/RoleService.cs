using backend.Data;
using backend.Models.DTOs.Role;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class RoleService : IRoleService
    {
        private readonly AppDbContext _context;

        public RoleService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<RoleResponseDto>> GetAllAsync()
        {
            return await _context.Roles
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .Select(x => new RoleResponseDto
                {
                    Id = x.Id,
                    Name = x.Name
                })
                .ToListAsync();
        }

        public async Task<RoleResponseDto> CreateAsync(RoleCreateDto dto)
        {
            var exists = await _context.Roles
                .AnyAsync(x => x.Name.ToLower() == dto.Name.ToLower());

            if (exists)
                throw new InvalidOperationException("Role already exists.");

            var role = new Role
            {
                Id = Guid.NewGuid(),
                Name = dto.Name.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            _context.Roles.Add(role);
            await _context.SaveChangesAsync();

            return new RoleResponseDto
            {
                Id = role.Id,
                Name = role.Name
            };
        }
    }
}
