import { 
  PostLayoutData, 
  CreatePostDto, 
  CreatePostResponse,
  N8nGenerateRequest,
  N8nGenerateResponse,
  N8nTriggerRequest,
  N8nTriggerResponse,
  BulkGenerateResult 
} from '../types/postLayout.types';

type CreatePostRequest = CreatePostDto;

class PostLayoutService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  private googleSheetsApiUrl = import.meta.env.VITE_GOOGLE_SHEETS_API_URL;
  private googleSheetsApiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
  private googleSheetId = import.meta.env.VITE_GOOGLE_SHEET_ID;
  private googleSheetRange = import.meta.env.VITE_GOOGLE_SHEET_RANGE || 'Post1!A2:F1000';
  private n8nWebhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;

  /**
   * Import data from Google Sheets - REAL IMPLEMENTATION
   */
  async importFromGoogleSheets(): Promise<PostLayoutData[]> {
    try {
      if (!this.googleSheetsApiKey || !this.googleSheetId) {
        throw new Error('Google Sheets API Key or Sheet ID is missing');
      }

      // Call Google Sheets API v4
      const url = `${this.googleSheetsApiUrl}/${this.googleSheetId}/values/${this.googleSheetRange}?key=${this.googleSheetsApiKey}`;
      
      console.log('Fetching from Google Sheets:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Sheets API Error:', errorText);
        throw new Error(`Google Sheets API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.values || data.values.length === 0) {
        throw new Error('No data found in the Google Sheet');
      }

      const rows = data.values as string[][];
      console.log('Raw data from Google Sheets:', rows);
      
      // Transform data to PostLayoutData format
      return rows.map((row, index) => {
        // Mapping theo columns trong sheet: outline, meta_title, meta_description, keyword, STATUS, Content
        const [outline, meta_title, meta_description, keyword, statusRaw, content] = row;
        
        // Determine status based on content availability
        let status: PostLayoutData['status'] = 'pending';
        if (statusRaw) {
          const statusLower = statusRaw.toLowerCase().trim();
          if (statusLower === 'ready') status = 'ready';
          else if (statusLower === 'created') status = 'created';
          else if (statusLower === 'generating') status = 'generating';
          else if (statusLower === 'error') status = 'error';
        }
        
        // Auto-determine status based on content availability
        if (!content || content.trim() === '') {
          status = 'need_generate'; // Needs content generation
        } else if (status === 'pending') {
          status = 'ready'; // Has content, ready to create post
        }
        
        return {
          id: `sheet_${index + 1}`,
          outline: outline || '',
          meta_title: meta_title || '',
          meta_description: meta_description || '',
          keyword: keyword || '',
          status,
          content: content || '',
          title: meta_title || '', // Default title from meta_title
          body: content || '', // Default body from content
          excerpt: meta_description || '', // Default excerpt from meta_description
          created_at: new Date().toISOString(),
        } as PostLayoutData;
      }).filter(item => item.outline.trim() !== ''); // Filter out empty rows
    } catch (error) {
      console.error('Google Sheets import error:', error);
      throw error;
    }
  }

  /**
   * Mock Google Sheets import for development
   */
  async mockImportFromGoogleSheets(): Promise<PostLayoutData[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return [
      {
        id: 'gs_1',
        outline: 'Comprehensive Guide to Digital Marketing in 2024: Strategies, Tools, and Best Practices',
        meta_title: 'Digital Marketing Guide 2024: Complete Strategy & Tools',
        meta_description: 'Master digital marketing with our comprehensive 2024 guide covering SEO, social media, PPC, content marketing, and analytics tools.',
        keyword: 'digital marketing guide 2024',
        status: 'ready',
        content: 'Digital marketing has evolved dramatically...'
      },
      {
        id: 'gs_2',
        outline: 'The Ultimate Travel Photography Tips: Capturing Perfect Moments Around the World',
        meta_title: 'Travel Photography Tips: Capture Perfect Moments Worldwide',
        meta_description: 'Learn professional travel photography techniques, equipment recommendations, and composition tips to capture stunning photos on your adventures.',
        keyword: 'travel photography tips',
        status: 'ready',
        content: 'Travel photography combines technical skill...'
      },
      {
        id: 'gs_3',
        outline: 'Sustainable Living: 50 Simple Ways to Reduce Your Environmental Impact',
        meta_title: 'Sustainable Living: 50 Easy Ways to Go Green in 2024',
        meta_description: 'Discover 50 practical and affordable ways to live sustainably, reduce waste, and minimize your environmental footprint.',
        keyword: 'sustainable living tips',
        status: 'pending',
        content: 'Sustainable living is not just a trend...'
      },
      {
        id: 'gs_4',
        outline: 'Remote Work Productivity: Tools, Tips, and Strategies for Success',
        meta_title: 'Remote Work Productivity: Essential Tools & Strategies 2024',
        meta_description: 'Boost your remote work productivity with proven tools, time management techniques, and workspace optimization strategies.',
        keyword: 'remote work productivity',
        status: 'ready',
        content: 'Remote work has become the new normal...'
      },
      {
        id: 'gs_5',
        outline: 'Healthy Meal Prep: 30 Quick and Nutritious Recipes for Busy Professionals',
        meta_title: 'Healthy Meal Prep: 30 Quick Recipes for Busy Professionals',
        meta_description: 'Save time and eat healthy with 30 meal prep recipes designed for busy professionals. Includes shopping lists and nutrition info.',
        keyword: 'healthy meal prep recipes',
        status: 'created',
        api_post_id: 'post_456',
        created_at: '2024-09-26T14:20:00Z'
      },
      {
        id: 'gs_6',
        outline: 'Cryptocurrency Investment Guide: Understanding Bitcoin, Ethereum, and DeFi',
        meta_title: 'Crypto Investment Guide 2024: Bitcoin, Ethereum & DeFi',
        meta_description: 'Learn cryptocurrency investing fundamentals, from Bitcoin basics to DeFi strategies. Safe investing tips for beginners.',
        keyword: 'cryptocurrency investment guide',
        status: 'generating',
        api_post_id: 'post_789',
        n8n_trigger_id: 'trigger_123',
        created_at: '2024-09-27T09:15:00Z'
      }
    ];
  }

  /**
   * Create a single post via API using new CreatePostDto
   */
  async createPost(data: PostLayoutData): Promise<CreatePostResponse> {
    const postData: CreatePostRequest = {
      title: data.title || data.meta_title,
      slug: this.generateSlug(data.keyword),
      body: data.body || data.content || data.outline,
      excerpt: data.excerpt || data.meta_description,
      status: 'draft',
      type: data.type || 'post',
      authorId: data.authorId,
      authorName: data.authorName,
      destinationId: data.destinationId,
      destinationName: data.destinationName,
      featuredImageUrl: data.featuredImageUrl,
      featuredImageId: data.featuredImageId,
      tagIds: data.tagIds,
      categoryIds: data.categoryIds,
      publishAt: data.publishAt,
      canonicalUrl: data.canonicalUrl,
      metaRobots: data.metaRobots,
      seoMeta: {
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        focus_keyword: data.keyword,
        ...data.seoMeta
      },
      schemaMarkup: data.schemaMarkup,
      structuredData: data.structuredData
    };

    const response = await fetch(`${this.baseUrl}/v1/Posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create post');
    }

    return await response.json();
  }

  /**
   * Trigger n8n workflow for content generation
   */
  async triggerContentGeneration(data: PostLayoutData, postId: string): Promise<N8nTriggerResponse> {
    const triggerData: N8nTriggerRequest = {
      post_id: postId,
      outline: data.outline,
      keyword: data.keyword,
      meta_title: data.meta_title,
      content_source: data.content,
      webhook_url: `${this.baseUrl}/api/webhooks/n8n/content-generated`
    };

    const response = await fetch(`${this.n8nWebhookUrl}/webhook/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(triggerData)
    });

    if (!response.ok) {
        console.log('Error triggerContentGeneration content generation:', await response.text());
      throw new Error('Failed to trigger content generation');
    }
    console.log('n8n trigger response:', await response.clone().text());
    return await response.json();
  }

  /**
   * Generate content for post layout via n8n
   */
  async generateContent(data: PostLayoutData): Promise<N8nGenerateResponse> {
    const generateData: N8nGenerateRequest = {
      post_layout_id: data.id,
      sheet_id: this.googleSheetId!,
      outline: data.outline,
      keyword: data.keyword,
      meta_title: data.meta_title,
      meta_description: data.meta_description
    };

    const response = await fetch(`${this.n8nWebhookUrl}/webhook/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generateData)
    });

    if (!response.ok) {
        console.log('Error generateContent content generation:', await response.text());
      throw new Error('Failed to trigger content generation');
    }

    console.log('n8n generate response:', await response.clone().text());
    return await response.json();
  }

  /**
   * Mock content generation for development
   */
  async mockGenerateContent(data: PostLayoutData): Promise<N8nGenerateResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock generated content based on outline
    const generatedContent = `
# ${data.meta_title}

${data.meta_description}

## Giới thiệu

${data.outline.substring(0, 200)}...

## Nội dung chính

Dựa trên outline: "${data.outline}", chúng tôi sẽ phân tích chi tiết các điểm sau:

1. **Điểm quan trọng đầu tiên**
   - Chi tiết 1
   - Chi tiết 2
   - Chi tiết 3

2. **Điểm quan trọng thứ hai** 
   - Phân tích A
   - Phân tích B
   - Phân tích C

## Kết luận

Với từ khóa "${data.keyword}", bài viết này cung cấp thông tin toàn diện và hữu ích cho người đọc.

*Bài viết được tạo tự động từ outline và sẽ được chỉnh sửa bởi editor.*
`;

    return {
      success: true,
      trigger_id: `gen_${Date.now()}`,
      estimated_completion: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
      content: generatedContent.trim()
    };
  }

  /**
   * Bulk generate content for multiple layouts
   */
  async bulkGenerateContent(items: PostLayoutData[]): Promise<BulkGenerateResult> {
    const results: BulkGenerateResult = {
      total: items.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const item of items) {
      try {
        await this.mockGenerateContent(item); // Use mock in development
        results.successful++;
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        results.failed++;
        results.errors.push({
          item_id: item.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Update Google Sheets with generated content
   */
  async updateSheetContent(layoutId: string, content: string): Promise<void> {
    // In production, this would update the Google Sheets with generated content
    // For now, this is a placeholder
    console.log(`Updating sheet content for layout ${layoutId}:`, content.substring(0, 100) + '...');
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Update post status after content generation
   */
  async updatePostStatus(postId: string, status: 'published' | 'draft'): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/v1/Posts/${postId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update post status');
    }
  }

  /**
   * Get post by ID
   */
  async getPost(postId: string) {
    const response = await fetch(`${this.baseUrl}/api/v1/Posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }

    return await response.json();
  }

  /**
   * Generate URL-friendly slug from keyword
   */
  private generateSlug(keyword: string): string {
    return keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim(); // Remove leading/trailing spaces
  }

  /**
   * Validate post layout data
   */
  validatePostData(data: PostLayoutData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.meta_title?.trim()) {
      errors.push('Meta title is required');
    }

    if (!data.meta_description?.trim()) {
      errors.push('Meta description is required');
    }

    if (!data.keyword?.trim()) {
      errors.push('Keyword is required');
    }

    if (!data.outline?.trim()) {
      errors.push('Outline is required');
    }

    if (data.meta_title && data.meta_title.length > 60) {
      errors.push('Meta title should be under 60 characters');
    }

    if (data.meta_description && data.meta_description.length > 160) {
      errors.push('Meta description should be under 160 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Export data to CSV
   */
  exportToCSV(data: PostLayoutData[], filename: string = 'post-layouts'): void {
    const headers = ['ID', 'Meta Title', 'Meta Description', 'Keyword', 'Status', 'Created At', 'Post ID'];
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.id,
        `"${item.meta_title.replace(/"/g, '""')}"`,
        `"${item.meta_description.replace(/"/g, '""')}"`,
        `"${item.keyword}"`,
        item.status,
        item.created_at || '',
        item.api_post_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default new PostLayoutService();