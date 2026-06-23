using backend.Data;
using backend.Models.DTOs.Employee;
using backend.Models.DTOs.FishFarm;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class EmployeeService : IEmployeeService
    {
        private readonly AppDbContext _context;
        private readonly IImageUploadService _imageUploadService;
        private readonly ICacheService _cacheService;
        private readonly ILogger _logger;

        private const string EmployeeCacheVersionKey = "employees_cache_version";
        private const string EmployeeGetAllCachePrefix = "employees_getall_";
        private const string DashboardTotalEmployeesKey = "dashboard_total_employees";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public EmployeeService(AppDbContext context, IImageUploadService imageUploadService, ICacheService cacheService, ILogger logger)
        {
            _context = context;
            _imageUploadService = imageUploadService;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<PagedResultDto<EmployeeResponseDto>> GetAllAsync(EmployeeQueryDto query)
        {
            var cacheKey = BuildGetAllCacheKey(query);

            var cachedResult =
                await _cacheService.GetAsync<PagedResultDto<EmployeeResponseDto>>(cacheKey);

            if (cachedResult != null)
            {
                _logger.LogDebug("Employees cache hit. CacheKey: {CacheKey}", cacheKey);
                return cachedResult;
            }

            var employeeQuery = _context.Employees
                .Include(x => x.FishFarm)
                .Include(x => x.Role)
                .Include(x => x.Images)
                .AsNoTracking()
                .AsQueryable();

            employeeQuery = employeeQuery.Where(x => x.IsActive == query.IsActive);

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                employeeQuery = employeeQuery.Where(x =>
                    x.Name.Contains(query.SearchTerm) ||
                    x.Email.Contains(query.SearchTerm));
            }

            if (query.FishFarmId.HasValue)
            {
                employeeQuery = employeeQuery.Where(x => x.FishFarmId == query.FishFarmId.Value);
            }

            if (query.RoleId.HasValue)
            {
                employeeQuery = employeeQuery.Where(x => x.RoleId == query.RoleId.Value);
            }

            var totalCount = await employeeQuery.CountAsync();

            var items = await employeeQuery
                .OrderBy(x => x.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(x => new EmployeeResponseDto
                {
                    Id = x.Id,
                    FishFarmId = x.FishFarmId,
                    FishFarmName = x.FishFarm.Name,
                    RoleId = x.RoleId,
                    RoleName = x.Role.Name,
                    Name = x.Name,
                    Email = x.Email,
                    Age = x.Age,
                    CertifiedUntil = x.CertifiedUntil,
                    IsActive = x.IsActive,
                    ImageUrl = x.Images
                        .Select(i => "/uploads/employees/" + i.ImageName)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var result = new PagedResultDto<EmployeeResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            _logger.LogInformation("Retrieved employees. PageNumber: {PageNumber}, PageSize: {PageSize}, TotalCount: {TotalCount}", query.PageNumber, query.PageSize, totalCount);

            _cacheService.Set(cacheKey, result, CacheDuration);

            return result;
        }

        public async Task<EmployeeResponseDto?> GetByIdAsync(Guid id)
        {
            var result = await _context.Employees
                .Include(x => x.FishFarm)
                .Include(x => x.Role)
                .Include(x => x.Images)
                .Where(x => x.Id == id)
                .Select(x => new EmployeeResponseDto
                {
                    Id = x.Id,
                    FishFarmId = x.FishFarmId,
                    FishFarmName = x.FishFarm.Name,
                    RoleId = x.RoleId,
                    RoleName = x.Role.Name,
                    Name = x.Name,
                    Email = x.Email,
                    Age = x.Age,
                    CertifiedUntil = x.CertifiedUntil,
                    IsActive = x.IsActive,
                    ImageUrl = x.Images
                        .Select(i => "/uploads/employees/" + i.ImageName)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (result == null)
            {
                _logger.LogWarning("Employee not found. EmployeeId: {EmployeeId}", id);
            }

            return result;
        }

        public async Task<EmployeeResponseDto> CreateAsync(EmployeeCreateDto dto)
        {
            var fishFarmExists = await _context.FishFarms
                .AnyAsync(x => x.Id == dto.FishFarmId && x.IsActive);

            if (!fishFarmExists)
                throw new InvalidOperationException("Fish farm not found.");

            var roleExists = await _context.Roles
                .AnyAsync(x => x.Id == dto.RoleId && x.IsActive);

            if (!roleExists)
                throw new InvalidOperationException("Role not found.");

            string? fileName = null;

            if (dto.Image != null)
            {
                fileName = await _imageUploadService.SaveEmployeeImageAsync(dto.Image);
            }

            var employee = new Employee
            {
                Id = Guid.NewGuid(),
                FishFarmId = dto.FishFarmId,
                RoleId = dto.RoleId,
                Name = dto.Name,
                Email = dto.Email,
                Age = dto.Age,
                CertifiedUntil = dto.CertifiedUntil,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            if (fileName != null)
            {
                employee.Images.Add(new EmployeeImage
                {
                    Id = Guid.NewGuid(),
                    ImageName = fileName,
                    UploadedAt = DateTime.UtcNow
                });
            }

            try
            {
                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();
                _cacheService.IncrementVersion(EmployeeCacheVersionKey);
                _cacheService.Remove(DashboardTotalEmployeesKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create employee. Uploaded image will be deleted. FileName: {FileName}", fileName);

                if (fileName != null)
                    _imageUploadService.DeleteEmployeeImage(fileName);

                throw;
            }

            var createdEmployee = await GetByIdAsync(employee.Id);

            _logger.LogInformation("Employee created successfully. EmployeeId: {EmployeeId}", employee.Id);


            return createdEmployee!;
        }

        public async Task<bool> UpdateAsync(Guid id, EmployeeUpdateDto dto)
        {
            var employee = await _context.Employees
                .Include(x => x.Images)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (employee == null)
                return false;

            var fishFarmExists = await _context.FishFarms
                .AnyAsync(x => x.Id == dto.FishFarmId && x.IsActive);

            if (!fishFarmExists)
                throw new InvalidOperationException("Fish farm not found.");

            var roleExists = await _context.Roles
                .AnyAsync(x => x.Id == dto.RoleId && x.IsActive);

            if (!roleExists)
                throw new InvalidOperationException("Role not found.");

            employee.FishFarmId = dto.FishFarmId;
            employee.RoleId = dto.RoleId;
            employee.Name = dto.Name;
            employee.Email = dto.Email;
            employee.Age = dto.Age;
            employee.CertifiedUntil = dto.CertifiedUntil;
            employee.UpdatedAt = DateTime.UtcNow;
            employee.UpdatedBy = "system";

            if (dto.Image != null)
            {
                var oldImage = employee.Images.FirstOrDefault();
                var newFileName = await _imageUploadService.SaveEmployeeImageAsync(dto.Image);

                if (oldImage != null)
                {
                    _imageUploadService.DeleteEmployeeImage(oldImage.ImageName);
                    oldImage.ImageName = newFileName;
                    oldImage.UploadedAt = DateTime.UtcNow;
                }
                else
                {
                    employee.Images.Add(new EmployeeImage
                    {
                        Id = Guid.NewGuid(),
                        ImageName = newFileName,
                        UploadedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Employee updated successfully. EmployeeId: {EmployeeId}", id);
            _cacheService.IncrementVersion(EmployeeCacheVersionKey);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var employee = await _context.Employees.FirstOrDefaultAsync(x => x.Id == id);

            if (employee == null)
                return false;

            employee.IsActive = false;
            employee.UpdatedAt = DateTime.UtcNow;
            employee.UpdatedBy = "system";

            await _context.SaveChangesAsync();
            _logger.LogInformation("Soft deleting employee. EmployeeId: {EmployeeId}", id);
            _cacheService.IncrementVersion(EmployeeCacheVersionKey);
            _cacheService.Remove(DashboardTotalEmployeesKey);
            return true;
        }

        private string BuildGetAllCacheKey(EmployeeQueryDto query)
        {
            var version = _cacheService.GetVersion(EmployeeCacheVersionKey);

            return EmployeeGetAllCachePrefix +
                   $"page_{query.PageNumber}_" +
                   $"size_{query.PageSize}_" +
                   $"search_{query.SearchTerm?.Trim().ToLower() ?? "none"}_" +
                   $"fishfarm_{query.FishFarmId?.ToString() ?? "all"}_" +
                   $"role_{query.RoleId?.ToString() ?? "all"}_" +
                   $"active_{query.IsActive}_" +
                   $"v_{version}";
        }
    }
}
