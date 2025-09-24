# Multi-Tenant CMS - Tenant Resolution Implementation Guide

## Tổng Quan
Hệ thống multi-tenant CMS đã được triển khai thành công với các tính năng:
- ✅ Tenant Resolution thông qua API headers
- ✅ Tenant Selector UI component
- ✅ Tenant Context và Service layer
- ✅ Automatic tenant initialization
- ✅ Tenant Guard cho CMS components

## Cấu Trúc Tenant System

### 1. Tenant Service (`src/services/tenantService.ts`)
```typescript
- getAvailableTenants(): Lấy danh sách tenant từ API
- setCurrentTenant(): Lưu tenant hiện tại vào localStorage
- getCurrentTenant(): Lấy tenant hiện tại từ localStorage
- switchTenant(): Chuyển đổi tenant và reload page
```

### 2. Tenant Context (`src/context/TenantContext.tsx`)
```typescript
- Quản lý state toàn cục của tenant
- Tự động load tenant data khi khởi tạo
- Provide các method để thao tác với tenant
```

### 3. API Integration (`src/services/api.ts`)
```typescript
// Đã thêm tenant headers vào mọi API request
headers: {
  'X-Tenant-ID': currentTenantId,
  'X-Tenant-Slug': currentTenantSlug,
  'Host': tenantDomain
}
```

### 4. UI Components
- **TenantSelector**: Dropdown để chọn tenant (trong Header)
- **TenantGuard**: Wrapper component kiểm tra tenant trước khi render CMS
- **TenantInitializer**: Tự động chọn tenant đầu tiên nếu chưa có

## Cách Sử Dụng

### 1. Truy Cập CMS
1. Mở http://localhost:5176/
2. Login vào hệ thống
3. Tenant Selector sẽ xuất hiện ở Header
4. Chọn tenant từ dropdown
5. Truy cập các trang CMS: `/cms/posts`, `/cms/media`, etc.

### 2. Chuyển Đổi Tenant
- Click vào Tenant Selector ở Header
- Chọn tenant mới từ danh sách
- Page sẽ reload với tenant context mới

### 3. Tenant Data Structure
```json
{
  "id": "tenant-uuid",
  "slug": "tenant-slug",
  "domain": "tenant.domain.com",
  "name": "Tenant Name",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## Backend Integration

### API Endpoints Cần Thiết
```
GET /api/tenants - Lấy danh sách tenant
GET /api/posts - Lấy posts của tenant hiện tại
POST /api/posts - Tạo post mới
PUT /api/posts/{id} - Cập nhật post
DELETE /api/posts/{id} - Xóa post
... (tương tự cho media, taxonomies, comments)
```

### Headers Required
Mọi API request sẽ có các headers:
```
X-Tenant-ID: {tenant-id}
X-Tenant-Slug: {tenant-slug}
Host: {tenant-domain}
Authorization: Bearer {jwt-token}
```

## Troubleshooting

### 1. Lỗi "Tenant not found"
- Kiểm tra backend có nhận được headers tenant
- Verify tenant ID/slug có tồn tại trong database
- Check API interceptor có inject headers đúng

### 2. Tenant Selector không hiển thị data
- Check API call `/api/tenants` có thành công
- Verify response format đúng với TenantResponse interface
- Check console log để debug

### 3. CMS components không load
- Verify TenantGuard có được wrap đúng
- Check currentTenant có được set trong localStorage
- Ensure API calls có tenant headers

## API Server Setup

### Backend Configuration (192.168.1.24:5000)
1. Ensure API server running trên http://192.168.1.24:5000
2. Enable CORS cho origin http://localhost:5176
3. Implement tenant resolution middleware:
   ```csharp
   // Check X-Tenant-ID hoặc X-Tenant-Slug header
   // Set tenant context cho database queries
   ```

### Database Schema
```sql
-- Tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    slug VARCHAR(255) UNIQUE,
    domain VARCHAR(255),
    name VARCHAR(255),
    created_at TIMESTAMP
);

-- Posts table (multi-tenant)
CREATE TABLE posts (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    title VARCHAR(255),
    content TEXT,
    status VARCHAR(50),
    created_at TIMESTAMP
);
```

## Testing

### 1. Test Tenant Selection
- Load homepage, check tenant selector
- Switch tenants, verify reload và context change
- Check localStorage có lưu tenant đúng

### 2. Test CMS Integration
- Navigate to `/cms/posts`
- Verify TenantGuard hoạt động
- Test CRUD operations với tenant context

### 3. Test API Headers
- Open DevTools Network tab
- Make API call từ CMS
- Verify request có tenant headers

## Next Steps

1. **Error Handling**: Thêm proper error boundaries
2. **Loading States**: Improve UX khi switch tenant
3. **Permissions**: Implement role-based access per tenant
4. **Caching**: Cache tenant data để tránh re-fetch
5. **SEO**: Add tenant-specific meta tags

## Current Status: ✅ COMPLETED
- ✅ Tenant resolution system hoàn thành
- ✅ API integration với headers
- ✅ UI components và UX flow
- ✅ Context management và state handling
- ✅ CMS integration với tenant guards

Server đang chạy tại: http://localhost:5176/
Backend API: http://192.168.1.24:5000/api
