using backend.Models.DTOs.FishFarm;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/v1/fish-farms")]
    public class FishFarmController : ControllerBase
    {
        private readonly IFishFarmService _fishFarmService;

        public FishFarmController(IFishFarmService fishFarmService)
        {
            _fishFarmService = fishFarmService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] FishFarmQueryDto query)
        {
            var result = await _fishFarmService.GetAllAsync(query);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _fishFarmService.GetByIdAsync(id);

            if (result == null)
                return NotFound("Fish farm not found.");

            return Ok(result);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] FishFarmCreateDto dto)
        {
            var result = await _fishFarmService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        [HttpPut("{id:guid}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Update(Guid id, [FromForm] FishFarmUpdateDto dto)
        {
            var updated = await _fishFarmService.UpdateAsync(id, dto);

            if (!updated)
                return NotFound("Fish farm not found.");

            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _fishFarmService.DeleteAsync(id);

            if (!deleted)
                return NotFound("Fish farm not found.");

            return NoContent();
        }
    }
}
