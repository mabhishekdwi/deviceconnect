# Deployment Guide

This guide will help you deploy DeviceConnect to Vercel and set up the local backend.

## 🚀 Quick Deployment

### 1. Prepare Your Repository

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Verify Structure**:
   ```
   deviceconnect/
   ├── server/           # Local backend
   ├── frontend/         # Vercel frontend
   ├── scripts/          # Utility scripts
   ├── package.json      # Backend dependencies
   └── README.md
   ```

### 2. Deploy to Vercel

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

3. **Environment Variables**:
   - Add `NEXT_PUBLIC_LOCAL_SERVER_URL` with your local server URL
   - Example: `http://localhost:3001` (for local development)
   - For production: Use your local machine's IP address

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project.vercel.app`

## 🔧 Local Backend Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-frontend
```

### 2. Test Setup

```bash
# Run the setup test
npm run test-setup
```

### 3. Start Local Server

```bash
# Start the backend server
npm run dev
```

The server will run on `http://localhost:3001`

## 🌐 Production Configuration

### Option 1: Local Development (Recommended)

1. **Keep backend local** (since ADB only works locally)
2. **Deploy frontend to Vercel**
3. **Configure environment variable**:
   ```
   NEXT_PUBLIC_LOCAL_SERVER_URL=http://YOUR_LOCAL_IP:3001
   ```

### Option 2: Remote Backend (Advanced)

If you want to run the backend on a remote server:

1. **Deploy backend to a VPS** (DigitalOcean, AWS, etc.)
2. **Install ADB on the server**
3. **Configure firewall** to allow port 3001
4. **Update environment variable**:
   ```
   NEXT_PUBLIC_LOCAL_SERVER_URL=http://YOUR_SERVER_IP:3001
   ```

## 🔒 Security Considerations

### For Local Development
- The backend runs locally, so it's secure
- CORS is configured to allow all origins (for development)
- No sensitive data is transmitted

### For Production
- Consider implementing authentication
- Use HTTPS for the backend
- Restrict CORS origins
- Add rate limiting

## 📱 Device Connection

### Android Setup

1. **Enable Developer Options**:
   - Settings > About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging**:
   - Settings > Developer Options
   - Enable "USB Debugging"
   - Enable "USB Debugging (Security Settings)"

3. **Connect Device**:
   - Connect via USB
   - Allow USB debugging when prompted
   - Device should appear in the web interface

### Troubleshooting

**Device not detected**:
- Check USB cable
- Try different USB ports
- Restart ADB: `adb kill-server && adb start-server`
- Check device authorization

**Frontend can't connect**:
- Verify backend is running
- Check environment variables
- Test API endpoint: `http://localhost:3001/api/health`

## 🔄 Updates and Maintenance

### Updating the Frontend
1. Make changes to `frontend/` directory
2. Push to GitHub
3. Vercel will auto-deploy

### Updating the Backend
1. Make changes to `server/` directory
2. Restart the local server: `npm run dev`

### Environment Variables
- Update in Vercel dashboard
- Redeploy if needed

## 📊 Monitoring

### Backend Health
- Check: `http://localhost:3001/api/health`
- Monitor logs in terminal

### Frontend Status
- Check Vercel dashboard
- Monitor build logs
- Check browser console for errors

## 🆘 Common Issues

### Build Failures
- Check Node.js version (v16+ required)
- Verify all dependencies are installed
- Check TypeScript errors

### Connection Issues
- Ensure backend is running
- Check firewall settings
- Verify environment variables

### ADB Issues
- Install Android SDK Platform Tools
- Add to system PATH
- Restart terminal/command prompt

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Run `npm run test-setup`
3. Check the logs
4. Create an issue on GitHub 