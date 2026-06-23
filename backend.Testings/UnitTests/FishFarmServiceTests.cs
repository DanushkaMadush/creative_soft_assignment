using backend.Data;
using backend.Models.DTOs.FishFarm;
using backend.Models.Entities;
using backend.Services.Implementations;
using backend.Services.Interfaces;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace backend.Testings.UnitTests;

[TestFixture]
public class FishFarmServiceTests
{
    private AppDbContext _context = null!;
    private Mock<IImageUploadService> _imageUploadServiceMock = null!;
    private FishFarmService _service = null!;
    private Mock<ICacheService> _cacheServiceMock = null!;
    private Mock<ILogger<FishFarmService>> _loggerMock = null!;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new AppDbContext(options);
        _imageUploadServiceMock = new Mock<IImageUploadService>();
        _cacheServiceMock = new Mock<ICacheService>();
        _loggerMock = new Mock<ILogger<FishFarmService>>();

        _service = new FishFarmService(
            _context,
            _imageUploadServiceMock.Object,
            _cacheServiceMock.Object,
            _loggerMock.Object);
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    [Test]
    public async Task GetByIdAsync_WhenFishFarmExists_ShouldReturnFishFarm()
    {
        var fishFarm = CreateFishFarm("Farm A");
        fishFarm.Images.Add(new FishFarmImage
        {
            Id = Guid.NewGuid(),
            ImageName = "farm-a.jpg"
        });

        _context.FishFarms.Add(fishFarm);
        await _context.SaveChangesAsync();

        var result = await _service.GetByIdAsync(fishFarm.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Farm A");
        result.ImageUrl.Should().Be("/uploads/fish_farms/farm-a.jpg");
    }

    [Test]
    public async Task GetByIdAsync_WhenFishFarmDoesNotExist_ShouldReturnNull()
    {
        var result = await _service.GetByIdAsync(Guid.NewGuid());

        result.Should().BeNull();
    }

    [Test]
    public async Task GetAllAsync_ShouldReturnPagedActiveFishFarms()
    {
        _context.FishFarms.AddRange(
            CreateFishFarm("B Farm"),
            CreateFishFarm("A Farm"),
            CreateFishFarm("Inactive Farm", isActive: false)
        );

        await _context.SaveChangesAsync();

        var query = new FishFarmQueryDto
        {
            IsActive = true,
            PageNumber = 1,
            PageSize = 10
        };

        var result = await _service.GetAllAsync(query);

        result.TotalCount.Should().Be(2);
        result.Items.Should().HaveCount(2);
        result.Items.First().Name.Should().Be("A Farm");
    }

    [Test]
    public async Task CreateAsync_ShouldCreateFishFarmAndReturnResponse()
    {
        var image = CreateMockImage();

        _imageUploadServiceMock
            .Setup(x => x.SaveFishFarmImageAsync(image))
            .ReturnsAsync("saved-farm.jpg");

        var dto = new FishFarmCreateDto
        {
            Name = "New Farm",
            Latitude = 10,
            Longitude = 20,
            NumberOfCages = 5,
            HasBarge = true,
            Image = image
        };

        var result = await _service.CreateAsync(dto);

        result.Name.Should().Be("New Farm");
        result.ImageUrl.Should().Be("/uploads/fish_farms/saved-farm.jpg");

        var savedFarm = await _context.FishFarms
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == result.Id);

        savedFarm.Should().NotBeNull();
        savedFarm!.Images.Should().ContainSingle();
        savedFarm.Images.First().ImageName.Should().Be("saved-farm.jpg");

        _imageUploadServiceMock.Verify(
            x => x.SaveFishFarmImageAsync(image),
            Times.Once);
    }

    [Test]
    public async Task UpdateAsync_WhenFishFarmExists_ShouldUpdateFishFarm()
    {
        var fishFarm = CreateFishFarm("Old Farm");

        _context.FishFarms.Add(fishFarm);
        await _context.SaveChangesAsync();

        var dto = new FishFarmUpdateDto
        {
            Name = "Updated Farm",
            Latitude = 30,
            Longitude = 40,
            NumberOfCages = 10,
            HasBarge = false
        };

        var result = await _service.UpdateAsync(fishFarm.Id, dto);

        result.Should().BeTrue();

        var updatedFarm = await _context.FishFarms.FindAsync(fishFarm.Id);

        updatedFarm!.Name.Should().Be("Updated Farm");
        updatedFarm.NumberOfCages.Should().Be(10);
        updatedFarm.UpdatedBy.Should().Be("system");
        updatedFarm.UpdatedAt.Should().NotBeNull();
    }

    [Test]
    public async Task DeleteAsync_WhenFishFarmExists_ShouldSoftDeleteFishFarm()
    {
        var fishFarm = CreateFishFarm("Farm To Delete");

        _context.FishFarms.Add(fishFarm);
        await _context.SaveChangesAsync();

        var result = await _service.DeleteAsync(fishFarm.Id);

        result.Should().BeTrue();

        var deletedFarm = await _context.FishFarms.FindAsync(fishFarm.Id);

        deletedFarm!.IsActive.Should().BeFalse();
        deletedFarm.UpdatedBy.Should().Be("system");
    }

    [Test]
    public async Task DeleteAsync_WhenFishFarmDoesNotExist_ShouldReturnFalse()
    {
        var result = await _service.DeleteAsync(Guid.NewGuid());

        result.Should().BeFalse();
    }

    private static FishFarm CreateFishFarm(
        string name,
        bool isActive = true,
        bool hasBarge = true)
    {
        return new FishFarm
        {
            Id = Guid.NewGuid(),
            Name = name,
            Latitude = 10,
            Longitude = 20,
            NumberOfCages = 5,
            HasBarge = hasBarge,
            IsActive = isActive,
            CreatedBy = "system"
        };
    }

    private static IFormFile CreateMockImage()
    {
        var fileMock = new Mock<IFormFile>();

        fileMock.Setup(x => x.FileName)
            .Returns("test.jpg");

        fileMock.Setup(x => x.Length)
            .Returns(1024);

        return fileMock.Object;
    }
}