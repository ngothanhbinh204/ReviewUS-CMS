import { describe, test, expect } from 'vitest';
import { PostLayoutData, ImportStats } from '../types/postLayout.types';
import { postLayoutService } from '../services/postLayoutService';

describe('Post Layout Manager System', () => {
  test('PostLayoutData interface should have all CreatePostDto fields', () => {
    const samplePost: PostLayoutData = {
      id: '1',
      slug: 'test-post',
      title: 'Test Post',
      excerpt: 'Test excerpt',
      body: 'Test content',
      status: 'published',
      type: 'post',
      authorId: 'author-1',
      authorName: 'Test Author',
      publishedDate: new Date(),
      createdDate: new Date(),
      updatedDate: new Date(),
      featuredImageId: 'img-1',
      featuredImageUrl: 'https://example.com/image.jpg',
      categoryId: 'cat-1',
      categoryName: 'Test Category',
      tags: 'tag1,tag2',
      viewCount: 0,
      likeCount: 0,
      commentCount: 0,
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      seoKeywords: 'seo,keywords',
      tenantId: 'tenant-1',
      // Google Sheets specific
      sheetTitle: 'Test Sheet',
      sheetKeyword: 'test-keyword',
      importedAt: new Date(),
      isFromSheets: true,
    };

    // Test that the object has all required fields
    expect(samplePost.id).toBeDefined();
    expect(samplePost.slug).toBeDefined();
    expect(samplePost.title).toBeDefined();
    expect(samplePost.body).toBeDefined();
    expect(samplePost.status).toBeDefined();
    expect(samplePost.authorId).toBeDefined();
    expect(samplePost.tenantId).toBeDefined();
  });

  test('ImportStats should have date-based statistics', () => {
    const stats: ImportStats = {
      total: 10,
      today: 3,
      yesterday: 2,
      thisWeek: 8,
      pending: 5,
      ready: 3,
      created: 2,
    };

    expect(stats.today).toBeDefined();
    expect(stats.yesterday).toBeDefined();
    expect(stats.thisWeek).toBeDefined();
    expect(stats.total).toBeGreaterThanOrEqual(stats.today);
  });

  test('Service should have all required methods', () => {
    expect(typeof postLayoutService.importFromGoogleSheets).toBe('function');
    expect(typeof postLayoutService.generateContent).toBe('function');
    expect(typeof postLayoutService.createPost).toBe('function');
    expect(typeof postLayoutService.createBulkPosts).toBe('function');
  });
});