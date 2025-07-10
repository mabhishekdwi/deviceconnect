const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const bodyParser = require('body-parser');

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
app.use(bodyParser.json());

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

// Helper to parse bounds string to coordinates
function parseBounds(bounds) {
  // bounds: "[left,top][right,bottom]"
  const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!match) return null;
  return {
    left: parseInt(match[1]),
    top: parseInt(match[2]),
    right: parseInt(match[3]),
    bottom: parseInt(match[4]),
  };
}

// Recursively search for the deepest node containing (x, y)
function findNodeAt(node, x, y, path = [], best = {node: null, path: []}) {
  if (!node) return best;
  if (node.$ && node.$.bounds) {
    const b = parseBounds(node.$.bounds);
    if (b && x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) {
      best = {node, path: [...path, node]};
    }
  }
  // Recurse into children
  for (const key in node) {
    if (Array.isArray(node[key])) {
      for (const child of node[key]) {
        best = findNodeAt(child, x, y, [...path, node], best);
      }
    }
  }
  return best;
}

// Generate XPath from node path
function generateXPath(path) {
  return path
    .map(n => {
      if (!n.$) return '';
      let tag = n['$'].class || n['$'].resource_id || n['$'].package || 'node';
      tag = tag.replace(/[:.]/g, '_');
      if (n['$'].resource_id) {
        return `//*[@resource-id='${n['$'].resource_id}']`;
      }
      return `//${tag}`;
    })
    .filter(Boolean)
    .join('');
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

// Endpoint to get a screenshot from the connected device and save it
app.get('/api/screenshot', (req, res) => {
  exec('adb exec-out screencap -p', { encoding: 'buffer', maxBuffer: 5 * 1024 * 1024 }, (err, stdout) => {
    if (err) {
      return res.status(500).send('Error capturing screenshot');
    }
    // Save the screenshot to a file
    const filePath = path.join(__dirname, 'latest_screenshot.png');
    fs.writeFile(filePath, stdout, (writeErr) => {
      if (writeErr) {
        console.error('Error saving screenshot:', writeErr);
        // Still return the screenshot to the frontend
      }
      res.set('Content-Type', 'image/png');
      res.send(stdout);
    });
  });
});

// Endpoint to get XPath locator from click coordinates
app.post('/api/locator', (req, res) => {
  const { x, y } = req.body;
  exec('adb shell uiautomator dump /sdcard/ui.xml', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to dump UI' });
    exec('adb pull /sdcard/ui.xml ./ui.xml', (err) => {
      if (err) return res.status(500).json({ error: 'Failed to pull UI XML' });
      fs.readFile('./ui.xml', (err, data) => {
        if (err) return res.status(500).json({ error: 'Failed to read UI XML' });
        xml2js.parseString(data, (err, result) => {
          if (err) return res.status(500).json({ error: 'Failed to parse XML' });
          const root = result.hierarchy.node ? result.hierarchy.node[0] : null;
          if (!root) return res.status(500).json({ error: 'No root node in XML' });
          const { node, path } = findNodeAt(root, x, y);
          if (!node) return res.status(404).json({ error: 'No element found at coordinates' });
          const xpath = generateXPath(path);
          res.json({ xpath });
        });
      });
    });
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