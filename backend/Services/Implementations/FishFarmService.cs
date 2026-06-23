using backend.Data;
using backend.Models.DTOs.FishFarm;
using backend.Models.Entities;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class FishFarmService : IFishFarmService
    {
        private readonly AppDbContext _context;
        private readonly IImageUploadService _imageUploadService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<FishFarmService> _logger;

        private const string FishFarmCacheVersionKey = "fishfarms_cache_version";
        private const string FishFarmGetAllCachePrefix = "fishfarms_getall_";
        private const string DashboardTotalFishFarmsKey = "dashboard_total_fishfarms";
        private const string DashboardFishFarmLocationsKey = "dashboard_fishfarm_locations";
        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public FishFarmService(AppDbContext context, IImageUploadService imageUploadService, ICacheService cacheService, ILogger<FishFarmService> logger)
        {
            _context = context;
            _imageUploadService = imageUploadService;
            _cacheService = cacheService;
            _logger = logger;
        }

        public async Task<PagedResultDto<FishFarmResponseDto>> GetAllAsync(FishFarmQueryDto query)
        {
            var cacheKey = BuildGetAllCacheKey(query);

            var cachedResult =
                await _cacheService.GetAsync<PagedResultDto<FishFarmResponseDto>>(cacheKey);

            if (cachedResult != null)
            {
                _logger.LogDebug("Fish farms cache hit. CacheKey: {CacheKey}", cacheKey);
                return cachedResult;
            }

            _logger.LogDebug("Fish farms cache miss. CacheKey: {CacheKey}", cacheKey);

            var fishFarmsQuery = _context.FishFarms
                .Include(x => x.Images)
                .AsNoTracking()
                .AsQueryable();

            fishFarmsQuery = fishFarmsQuery.Where(x => x.IsActive == query.IsActive);

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                fishFarmsQuery = fishFarmsQuery.Where(x =>
                    x.Name.Contains(query.SearchTerm));
            }

            if (query.HasBarge.HasValue)
            {
                fishFarmsQuery = fishFarmsQuery.Where(x => x.HasBarge == query.HasBarge.Value);
            }

            var totalCount = await fishFarmsQuery.CountAsync();

            var items = await fishFarmsQuery
                .OrderBy(x => x.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(x => new FishFarmResponseDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    NumberOfCages = x.NumberOfCages,
                    HasBarge = x.HasBarge,
                    IsActive = x.IsActive,
                    ImageUrl = x.Images
                        .Select(i => "/uploads/fish_farms/" + i.ImageName)
                        .FirstOrDefault()
                })
                .ToListAsync();

            var result = new PagedResultDto<FishFarmResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };

            _logger.LogInformation("Retrieved fish farms. PageNumber: {PageNumber}, PageSize: {PageSize}, TotalCount: {TotalCount}",
                query.PageNumber,
                query.PageSize,
                totalCount);

            _cacheService.Set(cacheKey, result, CacheDuration);

            return result;
        }

        public async Task<FishFarmResponseDto?> GetByIdAsync(Guid id)
        {
            var result = await _context.FishFarms
                .Include(x => x.Images)
                .Where(x => x.Id == id)
                .Select(x => new FishFarmResponseDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude,
                    NumberOfCages = x.NumberOfCages,
                    HasBarge = x.HasBarge,
                    IsActive = x.IsActive,
                    ImageUrl = x.Images
                        .Select(i => "/uploads/fish_farms/" + i.ImageName)
                        .FirstOrDefault()
                })
                .FirstOrDefaultAsync();

            if (result == null)
            {
                _logger.LogWarning("Fish farm not found. FishFarmId: {FishFarmId}", id);
            }

            return result;
        }

        public async Task<FishFarmResponseDto> CreateAsync(FishFarmCreateDto dto)
        {
            var fileName = await _imageUploadService.SaveFishFarmImageAsync(dto.Image);

            var fishFarm = new FishFarm
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                NumberOfCages = dto.NumberOfCages,
                HasBarge = dto.HasBarge,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system",
                Images = new List<FishFarmImage>
            {
                new FishFarmImage
                {
                    Id = Guid.NewGuid(),
                    ImageName = fileName,
                    UploadedAt = DateTime.UtcNow
                }
            }
            };

            try
            {
                _context.FishFarms.Add(fishFarm);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Fish farm created successfully. FishFarmId: {FishFarmId}", fishFarm.Id);

                _cacheService.IncrementVersion(FishFarmCacheVersionKey);
                _cacheService.Remove(DashboardTotalFishFarmsKey);
                _cacheService.Remove(DashboardFishFarmLocationsKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create fish farm. Uploaded image will be deleted. FileName: {FileName}", fileName);
                _imageUploadService.DeleteFishFarmImage(fileName);
                throw;
            }

            return new FishFarmResponseDto
            {
                Id = fishFarm.Id,
                Name = fishFarm.Name,
                Latitude = fishFarm.Latitude,
                Longitude = fishFarm.Longitude,
                NumberOfCages = fishFarm.NumberOfCages,
                HasBarge = fishFarm.HasBarge,
                IsActive = fishFarm.IsActive,
                ImageUrl = "/uploads/fish_farms/" + fileName
            };
        }

        public async Task<bool> UpdateAsync(Guid id, FishFarmUpdateDto dto)
        {
            var fishFarm = await _context.FishFarms
                .Include(x => x.Images)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (fishFarm == null)
                return false;

            fishFarm.Name = dto.Name;
            fishFarm.Latitude = dto.Latitude;
            fishFarm.Longitude = dto.Longitude;
            fishFarm.NumberOfCages = dto.NumberOfCages;
            fishFarm.HasBarge = dto.HasBarge;
            fishFarm.UpdatedAt = DateTime.UtcNow;
            fishFarm.UpdatedBy = "system";

            if (dto.Image != null)
            {
                var oldImage = fishFarm.Images.FirstOrDefault();

                var newFileName = await _imageUploadService.SaveFishFarmImageAsync(dto.Image);

                if (oldImage != null)
                {
                    _imageUploadService.DeleteFishFarmImage(oldImage.ImageName);
                    oldImage.ImageName = newFileName;
                    oldImage.UploadedAt = DateTime.UtcNow;
                }
                else
                {
                    fishFarm.Images.Add(new FishFarmImage
                    {
                        Id = Guid.NewGuid(),
                        ImageName = newFileName,
                        UploadedAt = DateTime.UtcNow
                    });
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Fish farm updated successfully. FishFarmId: {FishFarmId}", id);
            _cacheService.IncrementVersion(FishFarmCacheVersionKey);
            _cacheService.Remove(DashboardFishFarmLocationsKey);
            return true;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var fishFarm = await _context.FishFarms.FirstOrDefaultAsync(x => x.Id == id);

            if (fishFarm == null)
                return false;

            fishFarm.IsActive = false;
            fishFarm.UpdatedAt = DateTime.UtcNow;
            fishFarm.UpdatedBy = "system";

            await _context.SaveChangesAsync();
            _logger.LogInformation("Soft deleting fish farm. FishFarmId: {FishFarmId}", id);
            _cacheService.IncrementVersion(FishFarmCacheVersionKey);
            _cacheService.Remove(DashboardTotalFishFarmsKey);
            _cacheService.Remove(DashboardFishFarmLocationsKey);
            return true;
        }

        public async Task<List<EmployeeByFishFarmResponseDto>> GetByFishFarmIdAsync(Guid fishFarmId)
        {
            return await _context.Employees
                .AsNoTracking()
                .Where(e => e.FishFarmId == fishFarmId && e.IsActive)
                .Include(e => e.Role)
                .Include(e => e.Images)
                .OrderBy(e => e.Name)
                .Select(e => new EmployeeByFishFarmResponseDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Email = e.Email,
                    RoleName = e.Role.Name,
                    CertifiedUntil = e.CertifiedUntil,
                    IsActive = e.IsActive,
                    ImageUrl = e.Images
                        .Select(i => "/uploads/employees/" + i.ImageName)
                        .FirstOrDefault()
                })
                .ToListAsync();
        }

        private string BuildGetAllCacheKey(FishFarmQueryDto query)
        {
            var version = _cacheService.GetVersion(FishFarmCacheVersionKey);

            return FishFarmGetAllCachePrefix +
                   $"page_{query.PageNumber}_" +
                   $"size_{query.PageSize}_" +
                   $"search_{query.SearchTerm?.Trim().ToLower() ?? "none"}_" +
                   $"hasbarge_{query.HasBarge?.ToString() ?? "all"}_" +
                   $"active_{query.IsActive}_" +
                   $"v_{version}";
        }
    }
}
