# API Connection Guide

## Kết nối API giữa 2 máy tính

### 1. Cấu hình trên máy chạy C# API Server:

#### a) Cấu hình CORS trong ASP.NET Core:

```csharp
// Program.cs hoặc Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddCors(options =>
    {
        options.AddDefaultPolicy(builder =>
        {
            builder
                .AllowAnyOrigin()          // Hoặc chỉ định IP cụ thể: WithOrigins("http://192.168.1.101:5175")
                .AllowAnyMethod()          // GET, POST, PUT, DELETE
                .AllowAnyHeader();         // Authorization, Content-Type, etc.
        });
    });
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    app.UseCors(); // Thêm middleware CORS
    app.UseRouting();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
}
```

#### b) Cấu hình listen trên tất cả network interfaces:

```json
// appsettings.json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:5000"  // Listen trên tất cả IP addresses
      }
    }
  }
}
```

#### c) Kiểm tra Firewall:
- Windows: Mở port 5000 trong Windows Firewall
- Thêm rule cho Inbound Connections cho port 5000

### 2. Cấu hình trên máy chạy React:

#### a) Tạo file `.env`:
```bash
# IP thực của máy chạy C# API Server
VITE_API_URL=http://192.168.1.24:5000/api

# Để switch về localhost (development):
# VITE_API_URL=http://localhost:5000/api
```

#### b) Kiểm tra kết nối:
```bash
# Test ping đến máy API C#
ping 192.168.1.24

# Test API endpoint
curl http://192.168.1.24:5000/api/health
```

### 3. Các bước setup chi tiết:

#### Bước 1: Tìm IP của máy API
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
# hoặc
ip addr show
```

#### Bước 2: Cấu hình API Server (C#)
1. Sửa `appsettings.json` để listen trên `0.0.0.0:5000`
2. Thêm CORS policy trong `Program.cs`
3. Mở firewall port 5000
4. Start API server

#### Bước 3: Cấu hình React App
1. Tạo file `.env` với IP của máy API
2. Restart React dev server: `npm run dev`
3. Test kết nối từ browser

### 4. Troubleshooting:

#### Lỗi CORS:
```
Access to XMLHttpRequest at 'http://192.168.1.100:5000/api/auth/login' 
from origin 'http://192.168.1.101:5175' has been blocked by CORS policy
```
**Giải pháp:** Cấu hình CORS đúng trong API server

#### Lỗi Network:
```
ERR_NETWORK_IO_SUSPENDED
ERR_CONNECTION_REFUSED
```
**Giải pháp:** 
- Kiểm tra firewall
- Kiểm tra API server có chạy không
- Kiểm tra IP address đúng chưa

#### Lỗi SSL (nếu dùng HTTPS):
```
ERR_CERT_AUTHORITY_INVALID
```
**Giải pháp:** 
- Dùng HTTP cho development
- Hoặc setup SSL certificate đúng

### 5. Security Notes:

⚠️ **Lưu ý bảo mật:**

1. **Development only:** Cấu hình `AllowAnyOrigin()` chỉ dùng cho development
2. **Production:** Sử dụng `WithOrigins("https://yourdomain.com")` 
3. **Firewall:** Chỉ mở port cần thiết
4. **Network:** Đảm bảo cả 2 máy trong cùng mạng LAN tin cậy

### 6. Ví dụ cấu hình hoàn chỉnh:

#### API Server (C#):
```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5175", "http://127.0.0.1:5175") // React dev server
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run("http://0.0.0.0:5000");
```

#### React App (.env):
```bash
VITE_API_URL=http://192.168.1.24:5000/api
```

### 7. Checklist setup cho máy C# (192.168.1.24):

#### ✅ Cấu hình cần thiết trong C# API:

1. **Program.cs - CORS Configuration:**
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:5175",     // Local development
            "http://127.0.0.1:5175",    // Alternative localhost
            "http://[IP_CỦA_MÁY_REACT]:5175"  // IP máy React nếu khác
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

var app = builder.Build();
app.UseCors();  // Quan trọng: phải có dòng này!
```

2. **appsettings.json - Listen trên tất cả interfaces:**
```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://0.0.0.0:5000"
      }
    }
  }
}
```

3. **Windows Firewall (quan trọng!):**
   - Mở Windows Defender Firewall
   - Advanced Settings → Inbound Rules → New Rule
   - Port → TCP → 5000 → Allow → Apply

#### ✅ Test từ máy React:

```bash
# 1. Test ping
ping 192.168.1.24

# 2. Test API endpoint (khi C# server đã chạy)
curl -X GET http://192.168.1.24:5000/api/health

# 3. Test CORS từ browser console:
fetch('http://192.168.1.24:5000/api/health')
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
```

#### ✅ Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00Z"
}
```

### 8. Troubleshooting thường gặp:

❌ **ERR_CONNECTION_REFUSED**
- ✅ C# API server chưa chạy
- ✅ Port 5000 bị block bởi firewall
- ✅ Kiểm tra `netstat -an | findstr 5000`

❌ **CORS Error** 
- ✅ Chưa add `app.UseCors()` trong Program.cs
- ✅ Origins không đúng trong CORS policy

❌ **ERR_NETWORK_IO_SUSPENDED**
- ✅ 2 máy không cùng mạng LAN
- ✅ Router block internal communication
