using backend.Models.DTOs.Employee;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/v1/employees")]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] EmployeeQueryDto query)
        {
            var result = await _employeeService.GetAllAsync(query);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _employeeService.GetByIdAsync(id);

            if (result == null)
                return NotFound("Employee not found.");

            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] EmployeeCreateDto dto)
        {
            var result = await _employeeService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] EmployeeUpdateDto dto)
        {
            var updated = await _employeeService.UpdateAsync(id, dto);

            if (!updated)
                return NotFound("Employee not found.");

            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _employeeService.DeleteAsync(id);

            if (!deleted)
                return NotFound("Employee not found.");

            return NoContent();
        }
    }
}
