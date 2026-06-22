using backend.Data;
using backend.Models.DTOs.Dashboard;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services.Implementations
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _context;
        private readonly IMemoryCache _cache;

        private const string TotalFishFarmsKey = "dashboard_total_fishfarms";
        private const string TotalEmployeesKey = "dashboard_total_employees";
        private const string FishFarmLocationsKey = "dashboard_fishfarm_locations";

        private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(5);

        public DashboardService(AppDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<DashboardCountDto> GetTotalFishFarmsAsync()
        {
            return await _cache.GetOrCreateAsync(TotalFishFarmsKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;

                var total = await _context.FishFarms
                    .AsNoTracking()
                    .CountAsync(x => x.IsActive);

                return new DashboardCountDto { Total = total };
            }) ?? new DashboardCountDto();
        }

        public async Task<DashboardCountDto> GetTotalEmployeesAsync()
        {
            return await _cache.GetOrCreateAsync(TotalEmployeesKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;

                var total = await _context.Employees
                    .AsNoTracking()
                    .CountAsync(x => x.IsActive);

                return new DashboardCountDto { Total = total };
            }) ?? new DashboardCountDto();
        }

        public async Task<List<FishFarmLocationDto>> GetFishFarmLocationsAsync()
        {
            return await _cache.GetOrCreateAsync(FishFarmLocationsKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = CacheDuration;

                return await _context.FishFarms
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
            }) ?? new List<FishFarmLocationDto>();
        }

        public void ClearDashboardCache()
        {
            _cache.Remove(TotalFishFarmsKey);
            _cache.Remove(TotalEmployeesKey);
            _cache.Remove(FishFarmLocationsKey);
        }
    }
}