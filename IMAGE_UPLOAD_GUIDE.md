# 🖼️ Hướng dẫn chèn ảnh trong PostForm với Google Cloud Storage

## 🌟 Tính năng mới: GCS Image Upload & Management

Bây giờ tất cả ảnh được lưu trên **Google Cloud Storage** với URL đầy đủ và tự động tạo variants!

### 📸 Cấu trúc Image Data từ Backend

```json
{
  "id": "uuid",
  "url": "https://storage.googleapis.com/reviewus-bucket-132/uploads/tenant-id/2025/09/26/filename.webp",
  "alt": "Alt text",
  "meta": {
    "title": "Image title",
    "description": "Description",
    "caption": "Caption text"
  },
  "dimensions": {
    "width": 1920,
    "height": 1080,
    "aspectRatio": 1.777
  },
  "variants": [
    {
      "size": "thumbnail",
      "url": "https://storage.googleapis.com/reviewus-bucket-132/thumb_filename.webp",
      "dimensions": { "width": 150, "height": 84 },
      "fileSize": 15000
    },
    {
      "size": "medium",
      "url": "https://storage.googleapis.com/reviewus-bucket-132/med_filename.webp", 
      "dimensions": { "width": 500, "height": 281 },
      "fileSize": 45000
    },
    {
      "size": "large",
      "url": "https://storage.googleapis.com/reviewus-bucket-132/lg_filename.webp",
      "dimensions": { "width": 1024, "height": 576 },
      "fileSize": 120000
    },
    {
      "size": "full",
      "url": "https://storage.googleapis.com/reviewus-bucket-132/uploads/tenant-id/2025/09/26/filename.webp",
      "dimensions": { "width": 1920, "height": 1080 },
      "fileSize": 1024000
    }
  ],
  "fileSize": 1024000,
  "mimeType": "image/webp",
  "usageCount": 0
}
```

## 🚀 API Endpoints (Updated)

### 📤 Upload Media
```typescript
POST /api/media/upload
Content-Type: multipart/form-data
Body: FormData with file + metadata
Response: MediaDto with GCS URLs + variants
```

### 📋 Get Media List  
```typescript
GET /api/media?pageNumber=1&pageSize=20&mimeType=image/*&includeShared=true
Response: PagedResult<MediaDto>
Features: [Tenant isolation, Shared media, Image variants]
```

### 👁️ Get Single Media
```typescript  
GET /api/media/{id}
Response: MediaDto with full variant information
```

## 💡 Cách sử dụng: 3 phương pháp chèn ảnh

### 1. 📋 HTMLEditor với GCS Upload Built-in

Trong **Edit HTML mode**, bạn có:
- **🎯 Insert Image Button**: Upload trực tiếp lên GCS từ toolbar
- **🏷️ Quick HTML Tags**: H2, H3, Bold buttons để format nhanh
- **👀 Visual Preview**: Switch giữa edit và preview mode
- **🌐 GCS Integration**: Tự động upload và nhận full GCS URL

```tsx
// HTMLEditor tự động tạo HTML với GCS URL:
<figure class="image">
  <img 
    src="https://storage.googleapis.com/reviewus-bucket-132/uploads/tenant-id/2025/09/26/image.webp" 
    alt="Image Alt" 
    width="1920" 
    height="1080"
    style="max-width: 100%; height: auto;" 
    loading="lazy"
  />
  <figcaption>Image Caption</figcaption>
</figure>
```

### 2. 🎯 ImageManager Modal (Advanced + GCS)

Click **"Insert Image"** button trong PostForm để mở Image Manager:
- **📁 Browse GCS images**: Xem tất cả ảnh với thumbnail variants
- **⬆️ Drag & Drop upload**: Upload multiple files lên GCS cùng lúc  
- **🔍 Search & Filter**: Tìm ảnh theo meta.title, alt text
- **📊 File info**: Hiển thị dimensions, fileSize, variants
- **📋 Copy GCS URL**: Copy full GCS link để sử dụng ở nơi khác
- **✨ Smart insert**: Chọn ảnh → chèn với full GCS URL + metadata

### 3. ✋ Manual HTML Input với GCS URLs

Trong **HTML Source mode**, bạn có thể viết trực tiếp với GCS URLs:

```html
<!-- Standard GCS image -->
<img 
  src="https://storage.googleapis.com/reviewus-bucket-132/uploads/tenant-id/image.webp" 
  alt="Description" 
  style="max-width: 100%; height: auto;" 
  loading="lazy"
/>

<!-- Image with figure & caption + GCS -->
<figure class="image">
  <img 
    src="https://storage.googleapis.com/reviewus-bucket-132/uploads/tenant-id/image.webp" 
    alt="Alt text"
    width="1920" 
    height="1080"
  />
  <figcaption>Your image caption here</figcaption>
</figure>

<!-- Responsive image variants -->
<picture>
  <source 
    srcset="https://storage.googleapis.com/reviewus-bucket-132/lg_image.webp" 
    media="(min-width: 1024px)"
  >
  <source 
    srcset="https://storage.googleapis.com/reviewus-bucket-132/med_image.webp" 
    media="(min-width: 500px)"
  >
  <img 
    src="https://storage.googleapis.com/reviewus-bucket-132/thumb_image.webp" 
    alt="Responsive image"
    style="width: 100%; height: auto;"
  >
</picture>
```

## 🎨 Image Styling Options

### Responsive Images
```html
<img src="/path/to/image" style="width: 100%; max-width: 800px; height: auto;" />
```

### Centered Images  
```html
<div style="text-align: center;">
  <img src="/path/to/image" style="max-width: 100%; height: auto;" />
</div>
```

### Floating Images
```html
<!-- Float left -->
<img src="/path/to/image" style="float: left; margin: 0 15px 15px 0; max-width: 300px;" />

<!-- Float right -->
<img src="/path/to/image" style="float: right; margin: 0 0 15px 15px; max-width: 300px;" />
```

### Image Gallery
```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
  <img src="/api/v1/media/1" style="width: 100%; height: auto; border-radius: 8px;" />
  <img src="/api/v1/media/2" style="width: 100%; height: auto; border-radius: 8px;" />
  <img src="/api/v1/media/3" style="width: 100%; height: auto; border-radius: 8px;" />
</div>
```

## 🔧 Technical Implementation

### Components Created:
- ✅ **HTMLEditor**: Dual-mode editor với image upload
- ✅ **ImageManager**: Modal quản lý thư viện ảnh
- ✅ **MediaService**: API calls cho upload/fetch media

### API Integration:
- ✅ **POST** `/api/v1/media/upload` - Upload ảnh mới
- ✅ **GET** `/api/v1/media` - Lấy danh sách ảnh 
- ✅ **GET** `/api/v1/media/{id}` - Lấy ảnh theo ID

### Supported Formats:
- 📷 **Images**: JPG, PNG, GIF, WebP, SVG
- 📏 **Max size**: 5MB per file
- 🔄 **Auto-optimization**: Responsive và SEO-friendly

## 🚀 Usage Examples

### Test trên localhost:5175:

1. **Vào Create/Edit Post** → Content tab
2. **Click "Insert Image"** → Chọn ảnh từ thư viện hoặc upload mới
3. **Switch to "HTML Source"** → Chỉnh sửa code HTML nếu cần
4. **Preview mode** → Xem trước kết quả hiển thị
5. **Save** → HTML được lưu vào database với format đúng

### Kết quả Database:
```json
{
  "body": "<h2>Du lịch bờ Tây nước Mỹ</h2>\n<figure class=\"image\">\n  <img src=\"/api/v1/media/123\" alt=\"Beautiful sunset\" style=\"max-width: 100%; height: auto;\" />\n  <figcaption>Hoàng hôn tuyệt đẹp ở California</figcaption>\n</figure>\n<p>Nội dung bài viết...</p>"
}
```

---

## 📝 Notes & Best Practices

- **SEO-friendly**: Luôn có alt text cho accessibility
- **Responsive**: Images tự động scale theo device
- **Performance**: Lazy loading với `loading="lazy"`
- **Backup**: Giữ nguyên HTML structure để dễ maintain

🎉 **Giờ đây bạn có thể chèn ảnh vào bài viết một cách professional và user-friendly!**