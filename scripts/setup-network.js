#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Prioritize WiFi interfaces
  const wifiInterfaces = ['en0', 'wlan0', 'WiFi'];
  
  for (const name of wifiInterfaces) {
    if (interfaces[name]) {
      for (const interface of interfaces[name]) {
        if (interface.family === 'IPv4' && !interface.internal) {
          return interface.address;
        }
      }
    }
  }
  
  // Fallback to any non-internal IPv4
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

function updateEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const localIP = getLocalIP();
  
  console.log('Detected local IP:', localIP);
  
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update or add VITE_API_URL
    const apiUrlPattern = /^VITE_API_URL=.*$/m;
    const newApiUrl = `VITE_API_URL=http://${localIP}:5000/api`;
    
    if (apiUrlPattern.test(envContent)) {
      envContent = envContent.replace(apiUrlPattern, newApiUrl);
    } else {
      envContent += `\n${newApiUrl}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(`Updated .env with: ${newApiUrl}`);
  } else {
    console.error('.env file not found');
  }
}

// Run if called directly
if (require.main === module) {
  updateEnvFile();
}

module.exports = { getLocalIP, updateEnvFile };
