// Backend C# DbContext - ApplicationDbContext.cs
// This is example code for Entity Framework Core

using Microsoft.EntityFrameworkCore;

namespace ReviewUS.CMS.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Post> Posts { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        public DbSet<PostCategory> PostCategories { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Post entity
            modelBuilder.Entity<Post>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Slug).IsUnique();
                entity.Property(e => e.MetaTitle).HasMaxLength(255);
                entity.Property(e => e.MetaDescription).HasMaxLength(500);
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.AuthorId).HasMaxLength(450);
                entity.Property(e => e.AuthorName).HasMaxLength(255);
                
                // Configure JSON columns for complex data
                entity.Property(e => e.SeoMeta)
                    .HasConversion(
                        v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                        v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions)null));
                
                entity.Property(e => e.SchemaMarkup)
                    .HasConversion(
                        v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                        v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions)null));
                
                entity.Property(e => e.StructuredData)
                    .HasConversion(
                        v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions)null),
                        v => System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(v, (System.Text.Json.JsonSerializerOptions)null));

                // Configure indexes for better performance
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.PublishAt);
                entity.HasIndex(e => new { e.Title, e.Status }); // Composite index for duplicate checking
                entity.HasIndex(e => new { e.MetaTitle, e.Status }); // Composite index for duplicate checking
            });

            // Configure PostTag many-to-many relationship
            modelBuilder.Entity<PostTag>(entity =>
            {
                entity.HasKey(e => new { e.PostId, e.TagId });
                entity.HasOne<Post>()
                    .WithMany()
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne<Tag>()
                    .WithMany()
                    .HasForeignKey(e => e.TagId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure PostCategory many-to-many relationship
            modelBuilder.Entity<PostCategory>(entity =>
            {
                entity.HasKey(e => new { e.PostId, e.CategoryId });
                entity.HasOne<Post>()
                    .WithMany()
                    .HasForeignKey(e => e.PostId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasOne<Category>()
                    .WithMany()
                    .HasForeignKey(e => e.CategoryId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Tag entity
            modelBuilder.Entity<Tag>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
            });

            // Configure Category entity
            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Slug).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Slug).IsUnique();
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).HasMaxLength(100);
                entity.Property(e => e.LastName).HasMaxLength(100);
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Email).IsUnique();
            });
        }
    }

    // Additional Entity Models
    public class Tag
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ParentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = "user";
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? LastLoginAt { get; set; }
    }
}

// Program.cs configuration example
namespace ReviewUS.CMS
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // Add Entity Framework
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"),
                    b => b.MigrationsAssembly("ReviewUS.CMS")));

            // Add controllers
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                });

            // Add CORS for frontend
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", builder =>
                {
                    builder.WithOrigins("http://localhost:3000", "http://localhost:5173") // React dev servers
                           .AllowAnyMethod()
                           .AllowAnyHeader()
                           .AllowCredentials();
                });
            });

            // Add logging
            services.AddLogging(builder =>
            {
                builder.AddConsole();
                builder.AddDebug();
            });

            // Add API documentation
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseRouting();
            app.UseCors("AllowFrontend");

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}