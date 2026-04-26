/**
 * Creates a distributable ZIP from the packaged app.
 * Run after: npm run pack
 * Usage: node scripts/create-zip.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const distDir  = path.join(__dirname, '..', 'dist');
const appDir   = path.join(distDir, 'Nexora-win32-x64');
const zipPath  = path.join(distDir, 'Nexora-Setup-win32-x64.zip');

if (!fs.existsSync(appDir)) {
  console.error('Error: Run "npm run pack" first.');
  process.exit(1);
}

if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

try {
  // Use PowerShell's Compress-Archive on Windows
  execSync(
    `powershell -Command "Compress-Archive -Path '${appDir}\\*' -DestinationPath '${zipPath}'"`,
    { stdio: 'inherit' }
  );
  const stats = fs.statSync(zipPath);
  const mb = (stats.size / 1024 / 1024).toFixed(1);
  console.log(`\n✓ Created: dist/Nexora-Setup-win32-x64.zip (${mb} MB)`);
  console.log('  Share this ZIP — users extract it and run Nexora.exe');
} catch (e) {
  console.error('ZIP creation failed:', e.message);
}
