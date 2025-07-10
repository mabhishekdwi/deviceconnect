const { exec } = require('child_process');

console.log('🔍 Testing DeviceConnect Setup');
console.log('==============================\n');

// Test Node.js version
console.log('1. Checking Node.js version...');
const nodeVersion = process.version;
console.log(`   ✅ Node.js ${nodeVersion}\n`);

// Test ADB availability
console.log('2. Checking ADB availability...');
exec('adb version', (error, stdout, stderr) => {
  if (error) {
    console.log('   ❌ ADB is not available');
    console.log('   📥 Please install Android SDK Platform Tools:');
    console.log('      https://developer.android.com/studio/releases/platform-tools\n');
  } else {
    console.log('   ✅ ADB is available');
    console.log(`   📱 ${stdout.trim()}\n`);
  }

  // Test ADB devices command
  console.log('3. Testing ADB devices command...');
  exec('adb devices', (error, stdout, stderr) => {
    if (error) {
      console.log('   ❌ Failed to run adb devices');
      console.log(`   Error: ${error.message}\n`);
    } else {
      console.log('   ✅ ADB devices command works');
      console.log('   📋 Current devices:');
      const lines = stdout.trim().split('\n');
      if (lines.length <= 1) {
        console.log('      No devices connected');
      } else {
        lines.slice(1).forEach(line => {
          if (line.trim()) {
            console.log(`      ${line.trim()}`);
          }
        });
      }
      console.log('');
    }

    // Test dependencies
    console.log('4. Checking project dependencies...');
    const fs = require('fs');
    const path = require('path');

    const backendDeps = fs.existsSync(path.join(__dirname, '..', 'node_modules'));
    const frontendDeps = fs.existsSync(path.join(__dirname, '..', 'frontend', 'node_modules'));

    console.log(`   Backend dependencies: ${backendDeps ? '✅ Installed' : '❌ Missing'}`);
    console.log(`   Frontend dependencies: ${frontendDeps ? '✅ Installed' : '❌ Missing'}`);

    if (!backendDeps || !frontendDeps) {
      console.log('\n📦 To install dependencies, run:');
      console.log('   npm install');
      console.log('   npm run install-frontend');
    }

    console.log('\n🎉 Setup test completed!');
    console.log('\n📖 Next steps:');
    console.log('   1. Install dependencies if missing');
    console.log('   2. Start the backend: npm run dev');
    console.log('   3. Start the frontend: cd frontend && npm run dev');
    console.log('   4. Connect an Android device via USB');
    console.log('   5. Enable USB debugging on your device');
  });
}); 