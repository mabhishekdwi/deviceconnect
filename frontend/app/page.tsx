'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Smartphone, Wifi, WifiOff, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Device {
  id: string
  status: string
  lastSeen: string
}

interface DeviceData {
  devices: Device[]
  timestamp: string
  adbAvailable: boolean
  error?: string
}

function ScreenshotViewer() {
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [xpaths, setXpaths] = useState<string[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);

  const captureScreenshot = () => {
    setLoading(true);
    setTimestamp(Date.now());
    setXpaths([]);
  };

  const handleImageLoad = () => setLoading(false);

  const handleImageClick = async (e: React.MouseEvent<HTMLImageElement>) => {
    const img = imgRef.current;
    if (!img) return;
    const rect = img.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setXpaths(prev => [...prev, 'Locating...']);
    try {
      const res = await fetch('http://localhost:3001/api/locator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ x, y }),
      });
      const data = await res.json();
      setXpaths(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = data.bestXPath
          ? data.bestXPath
          : 'No element found at this position.';
        return updated;
      });
    } catch (err) {
      setXpaths(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = 'Error locating element.';
        return updated;
      });
    }
  };

  const handleClearXpaths = () => setXpaths([]);

  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-2">Device Screenshot</h2>
      <div className="mb-2 flex flex-row gap-4 items-center">
        <button
          onClick={captureScreenshot}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Capture Screenshot
        </button>
        <button
          onClick={handleClearXpaths}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
        >
          Clear XPaths
        </button>
      </div>
      <div className="flex flex-row items-start gap-6">
        {timestamp && (
          <img
            ref={imgRef}
            src={`http://localhost:3001/api/screenshot?${timestamp}`}
            alt="Device Screenshot"
            className="border rounded shadow max-w-full cursor-crosshair"
            style={{ maxHeight: 500 }}
            onLoad={handleImageLoad}
            onClick={handleImageClick}
          />
        )}
        {xpaths.length > 0 && (
          <div className="p-3 bg-gray-100 border rounded text-sm break-all min-w-[200px] flex flex-col gap-2">
            <strong>XPaths:</strong>
            {xpaths.map((xp, i) => (
              <div key={i} className="bg-white border rounded p-2 mb-1">
                {xp}
              </div>
            ))}
          </div>
        )}
      </div>
      {loading && <div className="text-gray-500 mb-2">Capturing screenshot...</div>}
    </div>
  );
}

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([])
  const [adbAvailable, setAdbAvailable] = useState<boolean>(false)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(process.env.NEXT_PUBLIC_LOCAL_SERVER_URL || 'http://localhost:3001')
    
    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
      setError('')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
      setError('Disconnected from local server')
    })

    newSocket.on('devices', (data: DeviceData) => {
      setDevices(data.devices)
      setAdbAvailable(data.adbAvailable)
      setLastUpdate(data.timestamp)
      if (data.error) {
        setError(data.error)
      } else {
        setError('')
      }
    })

    setSocket(newSocket)

    // Cleanup on unmount
    return () => {
      newSocket.close()
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'device':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'offline':
        return <WifiOff className="w-5 h-5 text-red-500" />
      case 'unauthorized':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'device':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'unauthorized':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">DeviceConnect</h1>
          </div>
          <p className="text-lg text-gray-600">Real-time Android device detection using ADB</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {isConnected ? 'Connected to local server' : 'Disconnected from local server'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${adbAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="font-medium">
                {adbAvailable ? 'ADB Available' : 'ADB Not Available'}
              </span>
            </div>
          </div>
          {lastUpdate && (
            <p className="text-sm text-gray-500 mt-2">
              Last updated: {formatTimestamp(lastUpdate)}
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Devices List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Connected Devices</h2>
          
          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No devices connected</p>
              <p className="text-gray-400 text-sm mt-2">
                Connect your Android device via USB and enable USB debugging
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {devices.map((device, index) => (
                <div
                  key={device.id}
                  className={`border rounded-lg p-4 ${getStatusColor(device.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(device.status)}
                      <div>
                        <h3 className="font-medium text-gray-900">{device.id}</h3>
                        <p className="text-sm capitalize">{device.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Last seen: {formatTimestamp(device.lastSeen)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Screenshot Viewer */}
        <ScreenshotViewer />

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to connect devices:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Enable Developer Options on your Android device</li>
            <li>Enable USB Debugging in Developer Options</li>
            <li>Connect your device via USB cable</li>
            <li>Allow USB debugging when prompted on your device</li>
            <li>Make sure ADB is installed and in your system PATH</li>
            <li>Start the local server: <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
} 