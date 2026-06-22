using backend.Data;
using backend.Models.DTOs.Dashboard;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        private readonly ICacheService _cacheService;

        private const string TotalFishFarmsKey = "dashboard_total_fishfarms";
        private const string TotalEmployeesKey = "dashboard_total_employees";
        private const string FishFarmLocationsKey = "dashboard_fishfarm_locations";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public DashboardService(AppDbContext context, ICacheService cacheService)
        {
            _context = context;
            _cacheService = cacheService;
        }

        public async Task<DashboardCountDto> GetTotalFishFarmsAsync()
        {
            var cachedResult =
                await _cacheService.GetAsync<DashboardCountDto>(TotalFishFarmsKey);

            if (cachedResult != null)
            {
                return cachedResult;
            }

            var total = await _context.FishFarms
                .AsNoTracking()
                .CountAsync(x => x.IsActive);

            var result = new DashboardCountDto
            {
                Total = total
            };

            _cacheService.Set(TotalFishFarmsKey, result, CacheDuration);

            return result;
        }

        public async Task<DashboardCountDto> GetTotalEmployeesAsync()
        {
            var cachedResult =
                await _cacheService.GetAsync<DashboardCountDto>(TotalEmployeesKey);

            if (cachedResult != null)
            {
                return cachedResult;
            }

            var total = await _context.Employees
                .AsNoTracking()
                .CountAsync(x => x.IsActive);

            var result = new DashboardCountDto
            {
                Total = total
            };

            _cacheService.Set(TotalEmployeesKey, result, CacheDuration);

            return result;
        }

        public async Task<List<FishFarmLocationDto>> GetFishFarmLocationsAsync()
        {
            var cachedResult =
                await _cacheService.GetAsync<List<FishFarmLocationDto>>(FishFarmLocationsKey);

            if (cachedResult != null)
            {
                return cachedResult;
            }

            var result = await _context.FishFarms
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.Name)
                .Select(x => new FishFarmLocationDto
                {
                    FishFarmId = x.Id,
                    FishFarmName = x.Name,
                    Latitude = x.Latitude,
                    Longitude = x.Longitude
                })
                .ToListAsync();

            _cacheService.Set(FishFarmLocationsKey, result, CacheDuration);

            return result;
        }
    }
}