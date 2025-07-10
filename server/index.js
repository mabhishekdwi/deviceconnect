const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store connected devices
let connectedDevices = [];

// Function to run adb devices command
function getAdbDevices() {
  return new Promise((resolve, reject) => {
    exec('adb devices', (error, stdout, stderr) => {
      if (error) {
        console.error('Error running adb devices:', error);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error('ADB stderr:', stderr);
      }
      
      // Parse the output
      const lines = stdout.trim().split('\n');
      const devices = [];
      
      // Skip the first line (header)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          const parts = line.split('\t');
          if (parts.length === 2) {
            devices.push({
              id: parts[0],
              status: parts[1],
              lastSeen: new Date().toISOString()
            });
          }
        }
      }
      
      resolve(devices);
    });
  });
}

// Function to check if ADB is available
function checkAdbAvailability() {
  return new Promise((resolve) => {
    exec('adb version', (error) => {
      resolve(!error);
    });
  });
}

// REST API endpoints
app.get('/api/devices', async (req, res) => {
  try {
    const adbAvailable = await checkAdbAvailability();
    if (!adbAvailable) {
      return res.status(500).json({
        error: 'ADB is not available. Please install Android SDK and add adb to your PATH.',
        devices: []
      });
    }
    
    const devices = await getAdbDevices();
    connectedDevices = devices;
    
    res.json({
      devices,
      timestamp: new Date().toISOString(),
      adbAvailable: true
    });
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({
      error: 'Failed to get devices',
      devices: [],
      adbAvailable: false
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send initial devices data
  socket.emit('devices', {
    devices: connectedDevices,
    timestamp: new Date().toISOString()
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Schedule device checking every 5 seconds
cron.schedule('*/5 * * * * *', async () => {
  try {
    const adbAvailable = await checkAdbAvailability();
    if (adbAvailable) {
      const devices = await getAdbDevices();
      connectedDevices = devices;
      
      // Emit to all connected clients
      io.emit('devices', {
        devices,
        timestamp: new Date().toISOString(),
        adbAvailable: true
      });
    } else {
      io.emit('devices', {
        devices: [],
        timestamp: new Date().toISOString(),
        adbAvailable: false,
        error: 'ADB is not available'
      });
    }
  } catch (error) {
    console.error('Error in scheduled device check:', error);
    io.emit('devices', {
      devices: [],
      timestamp: new Date().toISOString(),
      adbAvailable: false,
      error: 'Failed to check devices'
    });
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 ADB Device Detection Service`);
  console.log(`🌐 API: http://localhost:${PORT}/api/devices`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
}); 