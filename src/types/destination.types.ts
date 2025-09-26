export interface DestinationDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  schemaMarkup?: any;
  seoMeta?: any;
  coverImageId?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
}

export interface CreateDestinationDto {
  name: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  schemaMarkup?: any;
  seoMeta?: any;
  coverImageId?: string;
}

export interface UpdateDestinationDto extends CreateDestinationDto {
  id: string;
}

export interface DestinationListDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  city?: string;
  state?: string;
  country?: string;
  coverImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  postCount: number;
}

export interface DestinationSearchDto {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  city?: string;
  state?: string;
  country?: string;
  searchTerm?: string;
}

export interface DestinationQueryParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}
