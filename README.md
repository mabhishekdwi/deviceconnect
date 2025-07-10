# DeviceConnect - ADB Device Detection System

A real-time Android device detection system that uses ADB to monitor connected devices and displays them on a beautiful web interface deployed on Vercel.

## 🚀 Features

- **Real-time Device Detection**: Automatically detects Android devices connected via USB
- **Live Status Updates**: WebSocket connection for instant device status changes
- **Beautiful UI**: Modern, responsive interface built with Next.js and Tailwind CSS
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Vercel Deployment**: Frontend deployed on Vercel for easy access

## 🏗️ Architecture

```
[Local Machine] --runs--> [ADB Device Checker] --sends data--> [Vercel Frontend]
```

- **Local Backend**: Node.js + Express server that runs `adb devices`
- **Frontend**: Next.js app deployed on Vercel
- **Communication**: WebSocket for real-time updates

## 📋 Prerequisites

1. **Android SDK Platform Tools** (for ADB)
   - Download from [Android Developer](https://developer.android.com/studio/releases/platform-tools)
   - Add to your system PATH

2. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)

3. **Android Device**
   - Enable Developer Options
   - Enable USB Debugging
   - Connect via USB cable

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd deviceconnect
```

### 2. Install dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-frontend
```

### 3. Configure environment
Create a `.env.local` file in the `frontend` directory:
```bash
NEXT_PUBLIC_LOCAL_SERVER_URL=http://localhost:3001
```

## 🚀 Usage

### 1. Start the local backend server
```bash
npm run dev
```

This will start the Express server on `http://localhost:3001`

### 2. Start the frontend (for development)
```bash
cd frontend
npm run dev
```

### 3. Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the environment variable `NEXT_PUBLIC_LOCAL_SERVER_URL` to your local server URL
4. Deploy!

## 📱 Connecting Android Devices

1. **Enable Developer Options**:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings > Developer Options

2. **Enable USB Debugging**:
   - In Developer Options, enable "USB Debugging"
   - Enable "USB Debugging (Security Settings)" if available

3. **Connect Device**:
   - Connect your device via USB
   - Allow USB debugging when prompted
   - Your device should appear in the web interface

## 🔧 API Endpoints

### GET `/api/devices`
Returns the list of connected devices.

**Response:**
```json
{
  "devices": [
    {
      "id": "ABCD1234",
      "status": "device",
      "lastSeen": "2024-01-01T12:00:00.000Z"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "adbAvailable": true
}
```

### GET `/api/health`
Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

## 🌐 WebSocket Events

### `devices`
Emitted every 5 seconds with updated device information.

**Data:**
```json
{
  "devices": [...],
  "timestamp": "2024-01-01T12:00:00.000Z",
  "adbAvailable": true
}
```

## 🎨 Customization

### Styling
The frontend uses Tailwind CSS. You can customize the design by modifying:
- `frontend/tailwind.config.js` - Tailwind configuration
- `frontend/app/globals.css` - Global styles
- `frontend/app/page.tsx` - Main component

### Backend Configuration
Modify `server/index.js` to:
- Change the polling interval (currently 5 seconds)
- Add additional ADB commands
- Customize device parsing logic

## 🐛 Troubleshooting

### ADB Not Found
- Ensure Android SDK Platform Tools is installed
- Add `adb` to your system PATH
- Restart your terminal/command prompt

### No Devices Detected
- Check USB cable connection
- Enable USB debugging on your device
- Allow USB debugging when prompted
- Try different USB ports

### Frontend Can't Connect
- Ensure the local server is running on port 3001
- Check firewall settings
- Verify the `NEXT_PUBLIC_LOCAL_SERVER_URL` environment variable

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you encounter any issues, please:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information 