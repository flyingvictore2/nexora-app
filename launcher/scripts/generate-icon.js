/**
 * Run with: node scripts/generate-icon.js
 * Generates a basic SVG icon and converts to PNG for testing.
 * For production, replace assets/icon.png with a proper 512x512 icon.
 */

const fs = require('fs');
const path = require('path');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0a0a0a"/>
  <rect x="4" y="4" width="504" height="504" rx="78" fill="none" stroke="#e50914" stroke-width="4" opacity="0.4"/>
  <!-- N letter -->
  <text
    x="256" y="340"
    font-family="Arial Black, sans-serif"
    font-size="280"
    font-weight="900"
    text-anchor="middle"
    fill="#e50914"
    letter-spacing="-10"
  >N</text>
  <!-- Subtle glow -->
  <text
    x="256" y="340"
    font-family="Arial Black, sans-serif"
    font-size="280"
    font-weight="900"
    text-anchor="middle"
    fill="#e50914"
    filter="url(#glow)"
    opacity="0.3"
    letter-spacing="-10"
  >N</text>
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="blur"/>
    </filter>
  </defs>
</svg>`;

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

fs.writeFileSync(path.join(assetsDir, 'icon.svg'), svg);
console.log('✓ Generated assets/icon.svg');
console.log('');
console.log('Next steps:');
console.log('  1. Convert icon.svg → icon.png (512×512) using an online tool or Inkscape');
console.log('  2. Convert icon.png → icon.ico using https://icoconvert.com (256x256 max)');
console.log('  3. Copy the same PNG to assets/tray.png (resize to 16x16 or 22x22)');
console.log('  4. Run: npm run build');
