using backend.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<FishFarm> FishFarms { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<FishFarmImage> FishFarmImages { get; set; }
        public DbSet<EmployeeImage> EmployeeImages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<FishFarm>(entity =>
            {
                entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
                entity.Property(x => x.Latitude).HasPrecision(9, 4);
                entity.Property(x => x.Longitude).HasPrecision(9, 4);
                entity.Property(x => x.CreatedBy).HasMaxLength(100).IsRequired();
                entity.Property(x => x.UpdatedBy).HasMaxLength(100);
            });

            modelBuilder.Entity<Employee>(entity =>
            {
                entity.Property(x => x.Name).HasMaxLength(150).IsRequired();
                entity.Property(x => x.Email).HasMaxLength(255).IsRequired();
                entity.HasOne(x => x.FishFarm)
                    .WithMany(x => x.Employees)
                    .HasForeignKey(x => x.FishFarmId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne(x => x.Role)
                    .WithMany(x => x.Employees)
                    .HasForeignKey(x => x.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.Property(x => x.Name).HasMaxLength(50).IsRequired();
                entity.Property(x => x.CreatedBy).HasMaxLength(100).IsRequired();
                entity.HasIndex(x => x.Name).IsUnique();
            });

            modelBuilder.Entity<FishFarmImage>(entity =>
            {
                entity.Property(x => x.ImageName).HasMaxLength(255).IsRequired();
                entity.HasOne(x => x.FishFarm)
                    .WithMany(x => x.Images)
                    .HasForeignKey(x => x.FishFarmId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<EmployeeImage>(entity =>
            {
                entity.Property(x => x.ImageName).HasMaxLength(255).IsRequired();
                entity.HasOne(x => x.Employee)
                    .WithMany(x => x.Images)
                    .HasForeignKey(x => x.EmployeeId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
