# Troubleshooting Network Connection

## 🚨 Current Issue: Cannot ping 192.168.1.24

### Possible causes and solutions:

#### 1. ✅ Verify IP Address
```bash
# On the C# machine (Windows), check actual IP:
ipconfig
# Look for IPv4 Address under your network adapter

# On macOS/Linux:
ifconfig
# or
ip addr show
```

#### 2. ✅ Check if both machines are on same network
```bash
# On React machine, check your IP:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Should be something like 192.168.1.x
# Both machines should be in same subnet (192.168.1.x)
```

#### 3. ✅ Windows Firewall (Most common issue)
On the C# machine (Windows):
- Open Windows Defender Firewall
- Turn OFF firewall temporarily for testing
- Or add exception for port 5000

#### 4. ✅ Router/Network settings
- Some routers block device-to-device communication
- Try connecting both machines to same WiFi/Ethernet
- Check router admin panel for AP isolation settings

#### 5. ✅ Alternative testing methods
```bash
# Try different ports/protocols
nc -zv 192.168.1.24 5000  # Test specific port
telnet 192.168.1.24 5000  # Alternative test

# Check if C# API is actually running
netstat -an | findstr :5000  # On Windows C# machine
```

## 🛠 Quick Fixes to Try:

### Option A: Use localhost for now
```bash
# In .env, change back to localhost and run both on same machine:
VITE_API_URL=http://localhost:5000/api
```

### Option B: Find correct IP
```bash
# On C# Windows machine, run:
ipconfig /all

# Look for "Wireless LAN adapter" or "Ethernet adapter"
# Use that IPv4 address
```

### Option C: Use IP of React machine
```bash
# Check IP of this Mac:
ifconfig en0 | grep inet

# Update CORS in C# to allow this IP
```

## 🔧 What to check on C# machine (192.168.1.24):

1. **Confirm IP is correct:**
   ```cmd
   ipconfig
   ```

2. **Check if API is running:**
   ```cmd
   netstat -an | findstr :5000
   ```

3. **Test firewall:**
   ```cmd
   # Temporarily disable Windows Firewall
   # Control Panel > System and Security > Windows Defender Firewall
   ```

4. **CORS Configuration:**
   ```csharp
   // In Program.cs, allow all origins for testing:
   builder.Services.AddCors(options =>
   {
       options.AddDefaultPolicy(policy =>
       {
           policy.AllowAnyOrigin()
                 .AllowAnyMethod()
                 .AllowAnyHeader();
       });
   });
   ```

## 💡 Current Status:
- ✅ React app running on port 5175
- ✅ API configured for 192.168.1.24:5000
- ❌ Cannot reach C# machine (ping timeout)

**Next Steps:**
1. Verify IP address on C# machine
2. Check firewall settings
3. Confirm both machines on same network
