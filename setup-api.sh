#!/bin/bash

# Quick Setup Script for API Connection
echo "🚀 Setting up API connection to C# server (192.168.1.24)..."

echo "📝 Current .env configuration:"
cat .env

echo ""
echo "🔧 Testing connection to C# API server..."
echo "Pinging 192.168.1.24..."
ping -c 3 192.168.1.24

echo ""
echo "🌐 Testing API endpoint (this might fail if C# server not running):"
curl -X GET http://192.168.1.24:5000/api/health -w "\nStatus: %{http_code}\n" || echo "❌ API server not responding"

echo ""
echo "✅ Setup complete! Make sure:"
echo "   1. C# API server is running on 192.168.1.24:5000"
echo "   2. CORS is configured in Program.cs"
echo "   3. Windows Firewall allows port 5000"
echo "   4. USE_MOCK_API = false in src/services/mockApi.ts"

echo ""
echo "🚀 Starting React dev server..."
npm run dev
