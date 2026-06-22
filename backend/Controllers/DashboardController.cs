using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("total-fishfarms")]
        public async Task<IActionResult> GetTotalFishFarms()
        {
            var result = await _dashboardService.GetTotalFishFarmsAsync();
            return Ok(result);
        }

        [HttpGet("total-employees")]
        public async Task<IActionResult> GetTotalEmployees()
        {
            var result = await _dashboardService.GetTotalEmployeesAsync();
            return Ok(result);
        }

        [HttpGet("fishfarm-locations")]
        public async Task<IActionResult> GetFishFarmLocations()
        {
            var result = await _dashboardService.GetFishFarmLocationsAsync();
            return Ok(result);
        }
    }
}