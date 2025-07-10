# DeviceConnect Frontend

The frontend application for DeviceConnect, built with Next.js and deployed on Vercel.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Build
```bash
npm run build
npm start
```

## 🌐 Deployment on Vercel

### 1. Connect to Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Vercel will auto-detect Next.js

### 2. Environment Variables
Set the following environment variable in Vercel:
- `NEXT_PUBLIC_LOCAL_SERVER_URL`: URL of your local backend server (e.g., `http://localhost:3001`)

### 3. Deploy
Click "Deploy" and your app will be live!

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for local development:
```bash
NEXT_PUBLIC_LOCAL_SERVER_URL=http://localhost:3001
```

### Custom Domain
You can add a custom domain in your Vercel project settings.

## 📱 Features

- Real-time device status updates via WebSocket
- Responsive design with Tailwind CSS
- Device status indicators (connected, offline, unauthorized)
- Connection status monitoring
- Beautiful, modern UI

## 🎨 Styling

This project uses:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Next.js 14** with App Router

## 🔍 Troubleshooting

### Build Issues
- Ensure all dependencies are installed
- Check Node.js version (v16+ required)
- Verify TypeScript configuration

### Connection Issues
- Ensure local server is running
- Check environment variables
- Verify CORS settings on backend 