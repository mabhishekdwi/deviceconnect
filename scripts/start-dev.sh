#!/bin/bash

echo "🚀 Starting DeviceConnect Development Environment"
echo "================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if ADB is available
if ! command -v adb &> /dev/null; then
    echo "⚠️  ADB is not found in PATH. Please install Android SDK Platform Tools."
    echo "   Download from: https://developer.android.com/studio/releases/platform-tools"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Start the backend server
echo "🔧 Starting backend server..."
npm run dev &

# Wait a moment for the backend to start
sleep 3

# Start the frontend
echo "🌐 Starting frontend..."
cd frontend && npm run dev &

echo ""
echo "✅ Development environment started!"
echo "📱 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for user to stop
wait 