// Backend C# Controller - PostsController.cs
// This is example code for ASP.NET Core backend

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace ReviewUS.CMS.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<PostsController> _logger;

        public PostsController(ApplicationDbContext context, ILogger<PostsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Check if posts already exist in database
        /// POST /api/posts/check
        /// </summary>
        [HttpPost("check")]
        public async Task<ActionResult<List<PostExistenceResult>>> CheckPostsExistence([FromBody] CheckPostsRequest request)
        {
            try
            {
                if (request?.Posts == null || !request.Posts.Any())
                {
                    return BadRequest("Posts list is required");
                }

                var results = new List<PostExistenceResult>();

                foreach (var postToCheck in request.Posts)
                {
                    // Check for duplicate based on outline + meta_title combination
                    var existingPost = await _context.Posts
                        .Where(p => 
                            (p.Title == postToCheck.MetaTitle || p.MetaTitle == postToCheck.MetaTitle) &&
                            (p.Body.Contains(postToCheck.Outline) || p.Excerpt.Contains(postToCheck.Outline)) &&
                            p.Status != "deleted"
                        )
                        .Select(p => new { p.Id, p.Title, p.CreatedAt })
                        .FirstOrDefaultAsync();

                    results.Add(new PostExistenceResult
                    {
                        Outline = postToCheck.Outline,
                        MetaTitle = postToCheck.MetaTitle,
                        Exists = existingPost != null,
                        PostId = existingPost?.Id.ToString(),
                        ExistingTitle = existingPost?.Title,
                        CreatedAt = existingPost?.CreatedAt
                    });
                }

                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking posts existence");
                return StatusCode(500, "Internal server error while checking posts existence");
            }
        }

        /// <summary>
        /// Alternative method using query parameters for smaller requests
        /// GET /api/posts/check-single
        /// </summary>
        [HttpGet("check-single")]
        public async Task<ActionResult<PostExistenceResult>> CheckSinglePostExistence(
            [FromQuery] string outline, 
            [FromQuery] string metaTitle)
        {
            try
            {
                if (string.IsNullOrEmpty(outline) || string.IsNullOrEmpty(metaTitle))
                {
                    return BadRequest("Both outline and metaTitle are required");
                }

                var existingPost = await _context.Posts
                    .Where(p => 
                        (p.Title == metaTitle || p.MetaTitle == metaTitle) &&
                        (p.Body.Contains(outline) || p.Excerpt.Contains(outline)) &&
                        p.Status != "deleted"
                    )
                    .Select(p => new { p.Id, p.Title, p.CreatedAt })
                    .FirstOrDefaultAsync();

                return Ok(new PostExistenceResult
                {
                    Outline = outline,
                    MetaTitle = metaTitle,
                    Exists = existingPost != null,
                    PostId = existingPost?.Id.ToString(),
                    ExistingTitle = existingPost?.Title,
                    CreatedAt = existingPost?.CreatedAt
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking single post existence");
                return StatusCode(500, "Internal server error while checking post existence");
            }
        }

        /// <summary>
        /// Create new post
        /// POST /api/posts
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<CreatePostResponse>> CreatePost([FromBody] CreatePostDto dto)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrEmpty(dto.Title))
                {
                    return BadRequest("Title is required");
                }

                // Check for duplicate before creating (race condition prevention)
                var existingPost = await _context.Posts
                    .AnyAsync(p => 
                        (p.Title == dto.Title || p.MetaTitle == dto.Title) &&
                        p.Status != "deleted"
                    );

                if (existingPost)
                {
                    return Conflict("A post with this title already exists");
                }

                // Create new post entity
                var post = new Post
                {
                    Id = Guid.NewGuid(),
                    Title = dto.Title,
                    Slug = dto.Slug ?? GenerateSlug(dto.Title),
                    Body = dto.Body ?? string.Empty,
                    Excerpt = dto.Excerpt ?? string.Empty,
                    MetaTitle = dto.MetaTitle ?? dto.Title,
                    MetaDescription = dto.MetaDescription ?? string.Empty,
                    Status = "draft", // Always create as draft
                    AuthorId = dto.AuthorId ?? GetDefaultAuthorId(),
                    AuthorName = dto.AuthorName ?? "System",
                    DestinationId = dto.DestinationId,
                    DestinationName = dto.DestinationName ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    PublishAt = dto.PublishAt,
                    FeaturedImageUrl = dto.FeaturedImageUrl,
                    FeaturedImageId = dto.FeaturedImageId,
                    CanonicalUrl = dto.CanonicalUrl,
                    MetaRobots = dto.MetaRobots ?? "index,follow",
                    SeoMeta = dto.SeoMeta,
                    SchemaMarkup = dto.SchemaMarkup,
                    StructuredData = dto.StructuredData
                };

                _context.Posts.Add(post);
                await _context.SaveChangesAsync();

                // Handle tags and categories if provided
                if (dto.TagIds != null && dto.TagIds.Any())
                {
                    await AssignTagsToPost(post.Id, dto.TagIds);
                }

                if (dto.CategoryIds != null && dto.CategoryIds.Any())
                {
                    await AssignCategoriesToPost(post.Id, dto.CategoryIds);
                }

                var response = new CreatePostResponse
                {
                    Success = true,
                    Data = new CreatePostData
                    {
                        Id = post.Id.ToString(),
                        Title = post.Title,
                        Slug = post.Slug,
                        Status = post.Status,
                        CreatedAt = post.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        UpdatedAt = post.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    },
                    Message = "Post created successfully"
                };

                return CreatedAtAction(nameof(GetPost), new { id = post.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating post");
                return StatusCode(500, "Internal server error while creating post");
            }
        }

        // Helper methods
        private string GenerateSlug(string title)
        {
            return title.ToLowerInvariant()
                .Replace(" ", "-")
                .Replace(".", "")
                .Replace(",", "")
                .Replace(":", "")
                .Replace(";", "")
                .Replace("!", "")
                .Replace("?", "")
                .Replace("'", "")
                .Replace("\"", "");
        }

        private string GetDefaultAuthorId()
        {
            // Return system or admin user ID
            return "system-user-id";
        }

        private async Task AssignTagsToPost(Guid postId, List<string> tagIds)
        {
            // Implementation for post-tag relationships
            foreach (var tagId in tagIds)
            {
                _context.PostTags.Add(new PostTag
                {
                    PostId = postId,
                    TagId = Guid.Parse(tagId)
                });
            }
            await _context.SaveChangesAsync();
        }

        private async Task AssignCategoriesToPost(Guid postId, List<string> categoryIds)
        {
            // Implementation for post-category relationships
            foreach (var categoryId in categoryIds)
            {
                _context.PostCategories.Add(new PostCategory
                {
                    PostId = postId,
                    CategoryId = Guid.Parse(categoryId)
                });
            }
            await _context.SaveChangesAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Post>> GetPost(Guid id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null)
            {
                return NotFound();
            }
            return post;
        }
    }

    // DTOs and Models
    public class CheckPostsRequest
    {
        public List<PostToCheck> Posts { get; set; } = new();
    }

    public class PostToCheck
    {
        public string Outline { get; set; } = string.Empty;
        
        [Required]
        public string MetaTitle { get; set; } = string.Empty;
    }

    public class PostExistenceResult
    {
        public string Outline { get; set; } = string.Empty;
        public string MetaTitle { get; set; } = string.Empty;
        public bool Exists { get; set; }
        public string? PostId { get; set; }
        public string? ExistingTitle { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class CreatePostDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        public string? Slug { get; set; }
        public string? Body { get; set; }
        public string? Excerpt { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public string? AuthorId { get; set; }
        public string? AuthorName { get; set; }
        public string? DestinationId { get; set; }
        public string? DestinationName { get; set; }
        public DateTime? PublishAt { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public string? FeaturedImageId { get; set; }
        public string? CanonicalUrl { get; set; }
        public string? MetaRobots { get; set; }
        public Dictionary<string, object>? SeoMeta { get; set; }
        public Dictionary<string, object>? SchemaMarkup { get; set; }
        public Dictionary<string, object>? StructuredData { get; set; }
        public List<string>? TagIds { get; set; }
        public List<string>? CategoryIds { get; set; }
    }

    public class CreatePostResponse
    {
        public bool Success { get; set; }
        public CreatePostData Data { get; set; } = new();
        public string Message { get; set; } = string.Empty;
    }

    public class CreatePostData
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
        public string UpdatedAt { get; set; } = string.Empty;
    }

    // Entity Models (for reference)
    public class Post
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Excerpt { get; set; } = string.Empty;
        public string MetaTitle { get; set; } = string.Empty;
        public string MetaDescription { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string AuthorId { get; set; } = string.Empty;
        public string AuthorName { get; set; } = string.Empty;
        public string DestinationId { get; set; } = string.Empty;
        public string DestinationName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? PublishAt { get; set; }
        public string? FeaturedImageUrl { get; set; }
        public string? FeaturedImageId { get; set; }
        public string? CanonicalUrl { get; set; }
        public string MetaRobots { get; set; } = "index,follow";
        public Dictionary<string, object>? SeoMeta { get; set; }
        public Dictionary<string, object>? SchemaMarkup { get; set; }
        public Dictionary<string, object>? StructuredData { get; set; }
    }

    public class PostTag
    {
        public Guid PostId { get; set; }
        public Guid TagId { get; set; }
    }

    public class PostCategory
    {
        public Guid PostId { get; set; }
        public Guid CategoryId { get; set; }
    }
}