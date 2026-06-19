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

        public FishFarmService(AppDbContext context, IImageUploadService imageUploadService)
        {
            _context = context;
            _imageUploadService = imageUploadService;
        }

        public async Task<PagedResultDto<FishFarmResponseDto>> GetAllAsync(FishFarmQueryDto query)
        {
            var fishFarmsQuery = _context.FishFarms
                .Include(x => x.Images)
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

            return new PagedResultDto<FishFarmResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }

        public async Task<FishFarmResponseDto?> GetByIdAsync(Guid id)
        {
            return await _context.FishFarms
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
            }
            catch
            {
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
            return true;
        }
    }
}
