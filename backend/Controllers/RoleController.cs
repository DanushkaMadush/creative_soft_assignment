using backend.Models.DTOs.Role;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/v1/roles")]
    public class RoleController : ControllerBase
    {
        private readonly IRoleService _roleService;

        public RoleController(IRoleService roleService)
        {
            _roleService = roleService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _roleService.GetAllAsync();
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(RoleCreateDto dto)
        {
            var result = await _roleService.CreateAsync(dto);
            return Ok(result);
        }
    }
}
