// Base Types
export interface PostDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  status: "draft" | "published" | "scheduled";
  type: "post";
  publishAt?: string;
  authorId: string;
  author?: UserDto;
  destinationId?: string;
  destination?: DestinationDto;
  featuredImageId?: string;
  featuredImageUrl?: MediaDto;
  seoMeta?: SeoMetaDto;
  schemaMarkup?: any;
  structuredData?: any;
  canonicalUrl?: string;
  metaRobots: string;
  createdAt: string;
  updatedAt: string;
  taxonomies?: TaxonomyDto[];
  media?: MediaDto[];
  comments?: CommentDto[];
  viewCount?: number;
}

export interface CreatePostDto {
  title: string;
  slug?: string;
  excerpt?: string;
  body?: string;
  status?: string;
  publishAt?: string;
  destinationId?: string;
  featuredImageId?: string;
  seoMeta?: SeoMetaDto;
  schemaMarkup?: any;
  canonicalUrl?: string;
  metaRobots?: string;
  taxonomyIds?: string[];
  mediaIds?: string[];
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  id: string;
}

export interface PostListDto {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: string;
  publishAt?: string;
  authorId: string;
  author?: UserDto;
  featuredImageUrl?: MediaDto;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  commentsCount?: number;
}

// Revision Types
export interface PostRevisionDto {
  id: number;
  postId: string;
  editorId: string;
  editor?: UserDto;
  title?: string;
  excerpt?: string;
  body?: string;
  status?: string;
  publishAt?: string;
  seoMeta?: any;
  schemaMarkup?: any;
  structuredData?: any;
  canonicalUrl?: string;
  metaRobots?: string;
  revisionNotes?: string;
  changeType: "create" | "update" | "revert" | "manual";
  createdAt: string;
  performance?: RevisionPerformanceMetrics;
}

export interface PostRevisionListDto {
  id: number;
  postId: string;
  editorId: string;
  editor?: UserDto;
  changeType: "create" | "update" | "revert" | "manual";
  revisionNotes?: string;
  createdAt: string;
  performance?: {
    rank: number;
    performanceScore: number;
  };
}

export interface PostRevisionCompareDto {
  fromRevision: PostRevisionDto;
  toRevision: PostRevisionDto;
  differences: {
    title?: FieldDifference;
    excerpt?: FieldDifference;
    body?: FieldDifference;
    seoMeta?: FieldDifference;
  };
  summary: {
    totalChanges: number;
    majorChanges: number;
    minorChanges: number;
  };
}

export interface FieldDifference {
  added: string[];
  removed: string[];
  changed: {
    from: string;
    to: string;
  }[];
}

export interface RevertPostDto {
  revisionNotes?: string;
}

export interface CreateManualRevisionDto {
  revisionNotes: string;
  includeContent?: boolean;
  includeSeo?: boolean;
}

// Performance & Analytics Types
export interface RevisionPerformanceMetrics {
  rank: number;
  performanceScore: number;
  views: number;
  timeOnPage: number;
  bounceRate: number;
  socialShares: number;
  commentsCount: number;
}

export interface RevisionPerformanceDto {
  revisionId: number;
  rank: number;
  performanceScore: number;
  metrics: {
    views: number;
    timeOnPage: number;
    bounceRate: number;
    socialShares: number;
    commentsCount: number;
  };
  createdAt: string;
}

export interface RevisionAnalyticsDto {
  totalRevisions: number;
  revisionsByPeriod: {
    daily: number[];
    weekly: number[];
    monthly: number[];
  };
  topPerformingRevisions: RevisionPerformanceDto[];
  changeTypeDistribution: {
    create: number;
    update: number;
    revert: number;
    manual: number;
  };
  averageTimeBetweenRevisions: number;
}

export interface PostPerformanceCompareDto {
  currentRevision: RevisionPerformanceDto;
  bestRevision: RevisionPerformanceDto;
  comparison: {
    performanceDifference: number;
    viewsDifference: number;
    engagementDifference: number;
    recommendation: string;
  };
}

// SEO Types
export interface SeoMetaDto {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface SeoComparisonDto {
  fromRevision: {
    id: number;
    seoScore: number;
    seoMeta: SeoMetaDto;
  };
  toRevision: {
    id: number;
    seoScore: number;
    seoMeta: SeoMetaDto;
  };
  improvements: string[];
  regressions: string[];
  recommendations: string[];
}

export interface SeoImpactAnalysisDto {
  revisionId: number;
  seoScore: number;
  improvements: {
    category: string;
    impact: "high" | "medium" | "low";
    description: string;
  }[];
  issues: {
    category: string;
    severity: "critical" | "warning" | "info";
    description: string;
    fix: string;
  }[];
}

// Utility Types
export interface BulkRevisionResultDto {
  deletedCount: number;
  failedCount: number;
  errors: string[];
}

export interface RevisionAuditDto {
  id: string;
  action: string;
  userId: string;
  user?: UserDto;
  revisionId: number;
  details: any;
  timestamp: string;
}

// Query Parameters
export interface PostQueryParams {
  pageNumber?: number;
  pageSize?: number;
  status?: string;
  authorId?: string;
  destinationId?: string;
  search?: string;
}

export interface RevisionQueryParams {
  pageNumber?: number;
  pageSize?: number;
}

export interface RevisionCompareParams {
  fromRevision: number;
  toRevision: number;
}

// Related Types (assumed to exist)
export interface UserDto {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

export interface DestinationDto {
  id: string;
  name: string;
  slug: string;
}

export interface MediaDto {
  id: string;
  fileName: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface TaxonomyDto {
  id: string;
  name: string;
  slug: string;
  type: string;
}

export interface CommentDto {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}
