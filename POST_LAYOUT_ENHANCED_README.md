# Post Layout Manager - Enhanced System

## 📋 Tổng quan hệ thống

Hệ thống quản lý bài viết với khả năng import từ Google Sheets, tạo bài viết tự động và tích hợp n8n cho việc sinh nội dung.

## 🚀 Tính năng chính

### ✅ Import từ Google Sheets
- Import dữ liệu từ Google Sheets API v4
- Mapping tự động các trường: outline, meta_title, meta_description, keyword, STATUS, Content
- Xác định status tự động dựa trên nội dung có sẵn

### ✅ Quản lý bài viết
- Hiển thị danh sách bài viết với đầy đủ thông tin
- Filter theo ngày (Hôm nay, Hôm qua, Tuần này, Tất cả)  
- Tìm kiếm theo tiêu đề, từ khóa, outline
- Bulk operations (select, create, generate)

### ✅ Tạo bài viết
- Tạo bài viết individual hoặc bulk 
- **Gọi API thực tế** `/v1/Posts` để tạo bài viết
- Map đầy đủ theo schema `CreatePostDto`
- **Không kiểm tra trùng lặp** - cho phép tạo bài viết trùng

### ✅ Sinh nội dung tự động
- Tích hợp n8n webhook: `https://ad5244.n8nvps.site/webhook/c4798e99-a3e1-4d6e-9114-459b4d77f1cd`
- Tự động sinh content cho bài viết status `need_generate`
- Bulk generation với progress tracking

### ✅ Chỉnh sửa bài viết  
- Modal edit với form validation
- Real-time character count cho SEO fields
- Keyboard shortcuts (Esc, Ctrl+Enter)

## 🔧 Cấu hình hệ thống

### Environment Variables (.env)
```bash
# API Server
VITE_API_URL=http://192.168.10.34:5000/api

# Google Sheets API v4
VITE_GOOGLE_SHEETS_API_URL=https://sheets.googleapis.com/v4/spreadsheets
VITE_GOOGLE_SHEETS_API_KEY=AIzaSyAppXvVNZlnX1sc2gWOGOgh5IF33sqx0C4
VITE_GOOGLE_SHEET_ID=19R5rUxRCpFNQKnBpRI6KcmY8u5cJ0ISrREFIndVjjPE
VITE_GOOGLE_SHEET_RANGE=Post1!A2:F1000

# n8n Webhook
VITE_N8N_WEBHOOK_URL=https://ad5244.n8nvps.site/webhook/c4798e99-a3e1-4d6e-9114-459b4d77f1cd
```

### Google Sheets Format
| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| outline  | meta_title | meta_description | keyword | STATUS | Content |

### API Endpoints
- `POST /v1/Posts` - Tạo bài viết mới
- n8n webhook GET với query parameters để sinh content

## 📊 Data Flow

```mermaid
graph TD
    A[Google Sheets] --> B[Import Data]
    B --> C{Has Content?}
    C -->|Yes| D[Status: ready]
    C -->|No| E[Status: need_generate]
    
    D --> F[Create Post API]
    E --> G[Generate Content n8n]
    G --> H[Status: ready]
    H --> F
    
    F --> I[Status: created]
    I --> J[Post in Database]
```

## 💻 Cấu trúc Code

### Frontend Structure
```
src/
├── components/posts/
│   ├── PostLayoutManager.tsx    # Main UI component
│   └── EditPostLayoutModal.tsx  # Edit modal
├── hooks/
│   └── usePostLayoutManager.ts  # Business logic hook
├── services/
│   └── postLayoutService.ts     # API calls & data transform
├── types/
│   └── postLayout.types.ts      # TypeScript definitions
└── pages/
    └── admin/posts/layout/      # Page component
```

### Key Components

#### 1. PostLayoutManager.tsx
- UI component với stats cards, filters, bulk actions
- Date-based filtering (hôm nay, hôm qua, tuần này)
- Individual actions: Edit, Preview, Generate, Create

#### 2. usePostLayoutManager.ts  
- Custom hook quản lý tất cả business logic
- State management cho import, create, generate
- Filtering và pagination logic

#### 3. postLayoutService.ts
- Google Sheets API integration
- Posts API calls với đầy đủ CreatePostDto fields
- n8n webhook integration
- Error handling và fallback logic

#### 4. postLayout.types.ts
- Complete TypeScript definitions
- PostLayoutData interface với tất cả CreatePostDto fields
- API response types và stats interfaces

## 🔄 Status Flow

1. **Import**: `pending` → detect content → `ready` | `need_generate`
2. **Generate**: `need_generate` → `generating` → `ready` 
3. **Create**: `ready` → `creating` → `created`
4. **Error**: Any step → `error`

## ⚡ Performance & Security

### Optimizations
- Sequential API calls để tránh rate limiting
- Pagination với 10 items per page
- Efficient filtering và search
- Progress tracking cho bulk operations

### Security
- Input validation trước khi gọi API  
- Error handling comprehensive
- Safe data transformation
- API error logging

## 🚀 Deployment & Usage

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
```

### Usage Flow
1. **Import**: Click "Import from Google Sheets" → data populated
2. **Filter**: Chọn ngày hoặc tìm kiếm để filter
3. **Generate**: Click "Generate" cho items cần nội dung
4. **Create**: Click "Create Post" để tạo bài viết qua API
5. **Bulk**: Select multiple → Bulk Create/Generate

## 🛠️ Troubleshooting

### Common Issues
1. **Google Sheets API Error**: Check API key và sheet permissions
2. **Create Post API Error**: Verify API endpoint và data format
3. **n8n Webhook Timeout**: Check webhook URL và network connection

### Debug Mode
- Check browser console cho detailed logs
- API calls được log với request/response details
- Error messages hiển thị user-friendly trong toast notifications

## 📈 Future Enhancements

- [ ] Advanced date range picker
- [ ] Export functionality
- [ ] Advanced SEO optimization
- [ ] Image upload integration
- [ ] Advanced content templates
- [ ] Webhook status callbacks
- [ ] Advanced analytics dashboard

---

**Phiên bản hiện tại**: v2.0 - Enhanced with full API integration
**Cập nhật cuối**: September 2024