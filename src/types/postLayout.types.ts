export interface PostLayoutData {
  // Basic fields from sheets
  id: string;
  outline: string;
  meta_title: string;
  meta_description: string;
  keyword: string;
  status: 'pending' | 'ready' | 'created' | 'generating' | 'error' | 'need_generate';
  content?: string;
  created_at?: string;
  updated_at?: string;
  api_post_id?: string;
  n8n_trigger_id?: string;
  error_message?: string;
  
  // All CreatePostDto fields to prevent API errors
  title?: string; // Will default to meta_title
  slug?: string;
  authorId?: string;
  authorName?: string;
  destinationName?: string;
  featuredImageUrl?: string;
  commentCount?: number;
  averageRating?: number;
  type?: string;
  excerpt?: string; // Will default to meta_description
  body?: string; // Will default to content
  destinationId?: string;
  publishAt?: string;
  seoMeta?: Record<string, unknown>;
  schemaMarkup?: Record<string, unknown>;
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  featuredImageId?: string;
  tagIds?: string[];
  categoryIds?: string[];
  
  // Additional UI fields
  selected?: boolean;
  import_date?: string; // For date filtering
}

export interface ImportStats {
  total: number;
  pending: number;
  ready: number;
  created: number;
  generating: number;
  error: number;
  need_generate: number;
  today: number;
  yesterday: number;
  this_week: number;
}

export interface CreatePostDto {
  id?: string;
  title: string;
  slug?: string;
  authorId?: string;
  authorName?: string;
  destinationName?: string;
  createdAt?: string;
  updatedAt?: string;
  featuredImageUrl?: string;
  commentCount?: number;
  averageRating?: number;
  type?: string;
  excerpt?: string;
  body?: string;
  status?: string;
  destinationId?: string;
  publishAt?: string;
  seoMeta?: Record<string, unknown>;
  schemaMarkup?: Record<string, unknown>;
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  featuredImageId?: string;
  tagIds?: string[];
  categoryIds?: string[];
}

export type CreatePostRequest = CreatePostDto;

export interface CreatePostResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  message: string;
}

export interface N8nGenerateRequest {
  post_layout_id: string;
  sheet_id: string;
  outline: string;
  keyword: string;
  meta_title: string;
  meta_description: string;
}

export interface N8nGenerateResponse {
  success: boolean;
  trigger_id: string;
  estimated_completion?: string;
  content?: string;
  message?: string;
  execution_id?: string;
}

export interface N8nTriggerRequest {
  post_id: string;
  outline: string;
  keyword: string;
  meta_title: string;
  content_source?: string;
  webhook_url?: string;
}

export interface N8nTriggerResponse {
  success: boolean;
  trigger_id: string;
  webhook_id: string;
  estimated_completion: string;
}

export interface GoogleSheetsRow {
  outline: string;
  meta_title: string;
  meta_description: string;
  keyword: string;
  status: string;
  content?: string;
}

export interface BulkCreateResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    item_id: string;
    error: string;
  }>;
}

export interface BulkGenerateResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    item_id: string;
    error: string;
  }>;
}

export interface FilterOptions {
  search: string;
  status: string;
  dateFrom?: string;
  dateTo?: string;
  keyword?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}