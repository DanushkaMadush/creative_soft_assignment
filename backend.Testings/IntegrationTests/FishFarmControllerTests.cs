using backend.Data;
using backend.Models.Entities;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestPlatform.TestHost;
using System.Net;
using System.Text.Json;

namespace backend.Testings.IntegrationTests;

[TestFixture]
public class FishFarmControllerTests
{
    private WebApplicationFactory<Program> _factory = null!;
    private HttpClient _client = null!;

    [SetUp]
    public void Setup()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    var descriptor = services.SingleOrDefault(
                        d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

                    if (descriptor != null)
                        services.Remove(descriptor);

                    services.AddDbContext<AppDbContext>(options =>
                    {
                        var dbName = "FishFarmTestDb";
                        options.UseInMemoryDatabase(dbName);
                    });

                    var provider = services.BuildServiceProvider();

                    using var scope = provider.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    SeedData(context);
                });
            });

        _client = _factory.CreateClient();
    }

    [TearDown]
    public void TearDown()
    {
        _client.Dispose();
        _factory.Dispose();
    }

    [Test]
    public async Task GetAll_ShouldReturnOk()
    {
        var response = await _client.GetAsync("/api/v1/fish-farms");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Test]
    public async Task GetById_WhenFishFarmExists_ShouldReturnOk()
    {
        var fishFarmId = TestIds.FishFarmId;

        var response = await _client.GetAsync($"/api/v1/fish-farms/{fishFarmId}");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        var name = document.RootElement.GetProperty("name").GetString();

        name.Should().Be("Integration Farm");
    }

    [Test]
    public async Task GetById_WhenFishFarmDoesNotExist_ShouldReturnNotFound()
    {
        var response = await _client.GetAsync($"/api/v1/fish-farms/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Test]
    public async Task Delete_WhenFishFarmExists_ShouldReturnNoContent()
    {
        var response = await _client.DeleteAsync($"/api/v1/fish-farms/{TestIds.FishFarmId}");

        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private static void SeedData(AppDbContext context)
    {
        context.Database.EnsureDeleted();
        context.Database.EnsureCreated();

        var fishFarm = new FishFarm
        {
            Id = TestIds.FishFarmId,
            Name = "Integration Farm",
            Latitude = 10,
            Longitude = 20,
            NumberOfCages = 5,
            HasBarge = true,
            IsActive = true,
            CreatedBy = "system",
            Images =
            [
                new FishFarmImage
                {
                    Id = Guid.NewGuid(),
                    ImageName = "integration-farm.jpg"
                }
            ]
        };

        context.FishFarms.Add(fishFarm);
        context.SaveChanges();
    }

    private static class TestIds
    {
        public static readonly Guid FishFarmId =
            Guid.Parse("11111111-1111-1111-1111-111111111111");
    }
}
