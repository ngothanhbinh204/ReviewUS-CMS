# API Test Guide - Posts Management

## Server Status
✅ **Development server**: http://localhost:5178/
✅ **Backend API**: http://192.168.1.24:5000/api

## Components Updated
- ✅ PostsList: Cập nhật để phù hợp với API response structure
- ✅ PostForm: Tạo mới với form tạo/sửa posts
- ✅ CMS API Service: Cập nhật types và endpoints
- ✅ Tenant System: Hoàn chỉnh với headers injection

## Test Steps

### 1. Kiểm tra Posts List
1. Truy cập: http://localhost:5178/cms/posts
2. Tenant selector sẽ xuất hiện ở header
3. Chọn tenant từ dropdown
4. Kiểm tra API call GET /api/posts với tenant headers:
   ```
   X-Tenant-ID: {tenant-id}
   X-Tenant-Slug: {tenant-slug}
   Host: {tenant-domain}
   ```

### 2. Kiểm tra Create Post
1. Click "Create Post" button
2. Điền form và submit
3. Kiểm tra API call POST /api/posts với dữ liệu:
   ```json
   {
     "title": "Test Post",
     "slug": "test-post",
     "excerpt": "Test excerpt",
     "content": "Test content",
     "status": "draft",
     "type": "post",
     "publishAt": "2024-01-01T00:00:00",
     "destinationName": "Test Destination"
   }
   ```

### 3. Kiểm tra Edit Post
1. Click "Edit" trên bất kỳ post nào
2. Form sẽ load data hiện tại
3. Chỉnh sửa và save
4. Kiểm tra API call PUT /api/posts/{id}

### 4. Kiểm tra Delete Post
1. Click "Delete" trên post
2. Confirm deletion
3. Kiểm tra API call DELETE /api/posts/{id}

## Response Structure
Posts API sẽ trả về theo format:
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "type": "string",
      "excerpt": "string",
      "status": "string",
      "authorId": "uuid",
      "authorName": "string",
      "destinationName": "string",
      "publishAt": "2025-09-24T03:33:21.587Z",
      "createdAt": "2025-09-24T03:33:21.587Z",
      "updatedAt": "2025-09-24T03:33:21.587Z",
      "featuredImageUrl": "string",
      "commentCount": 0,
      "averageRating": 0
    }
  ],
  "totalCount": 0,
  "pageNumber": 1,
  "pageSize": 10,
  "totalPages": 0,
  "hasPreviousPage": false,
  "hasNextPage": false
}
```

## Next Steps
1. ✅ Posts management hoàn chỉnh
2. 🔄 Test với backend API thực tế
3. ⏳ Triển khai Media management
4. ⏳ Triển khai Categories/Tags management  
5. ⏳ Triển khai Comments management

## Debug Tips
- Mở DevTools Network tab để xem API calls
- Kiểm tra tenant headers có được gửi đúng
- Verify response format match với expected structure
- Check console cho errors
