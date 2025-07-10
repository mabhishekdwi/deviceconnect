@echo off
echo 🚀 Starting DeviceConnect Development Environment
echo ================================================

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if ADB is available
adb version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  ADB is not found in PATH. Please install Android SDK Platform Tools.
    echo    Download from: https://developer.android.com/studio/releases/platform-tools
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Start the backend server
echo 🔧 Starting backend server...
start "DeviceConnect Backend" cmd /k "npm run dev"

REM Wait a moment for the backend to start
timeout /t 3 /nobreak >nul

REM Start the frontend
echo 🌐 Starting frontend...
start "DeviceConnect Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Development environment started!
echo 📱 Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo.
echo Close the command windows to stop the services
echo.
pause 