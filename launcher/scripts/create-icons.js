/**
 * Creates minimal valid PNG and ICO icon files for the Electron build.
 * These are placeholder icons — replace assets/icon.png and icon.ico
 * with your real 512×512 branded icon before distributing.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// ── Minimal PNG builder ────────────────────────────────────────────────────
function createPNG(width, height, pixels) {
  // pixels: flat array of [R,G,B,A, ...]

  // Raw image data (filter byte 0 per scanline)
  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter type None
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      raw.push(pixels[i], pixels[i+1], pixels[i+2], pixels[i+3]);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(raw));

  function crc32(buf) {
    const table = (() => {
      const t = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let c = i;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
        t[i] = c;
      }
      return t;
    })();
    let crc = 0xFFFFFFFF;
    for (const b of buf) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const checksum = Buffer.alloc(4);
    checksum.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, checksum]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const idat = compressed;
  const iend = Buffer.alloc(0);

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', iend),
  ]);
}

// ── Draw a simple "N" logo on dark red background ─────────────────────────
function drawIcon(size) {
  const pixels = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // Background: dark (#0a0a0a)
      pixels[i]   = 10;
      pixels[i+1] = 10;
      pixels[i+2] = 10;
      pixels[i+3] = 255;

      // Rounded corners (alpha mask)
      const r = size * 0.18;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const halfS = size / 2;

      // Simple rounded rect check (corner radius r)
      const inCorner = Math.abs(cx) > halfS - r && Math.abs(cy) > halfS - r;
      if (inCorner) {
        const dx = Math.abs(cx) - (halfS - r);
        const dy = Math.abs(cy) - (halfS - r);
        if (dx * dx + dy * dy > r * r) {
          pixels[i+3] = 0; // transparent
          continue;
        }
      }

      // Draw "N" letter in red (#e50914)
      const nx = x / size;   // 0..1
      const ny = y / size;   // 0..1

      // N bounding box: 20%-80% horizontally, 18%-82% vertically
      const px = (nx - 0.2) / 0.6;
      const py = (ny - 0.18) / 0.64;

      if (px >= 0 && px <= 1 && py >= 0 && py <= 1) {
        const t = 0.18; // stroke thickness relative to bounding box width

        // Left vertical bar
        const inLeft  = px < t;
        // Right vertical bar
        const inRight = px > 1 - t;
        // Diagonal stroke: from top-left to bottom-right
        // line from (t, 0) to (1-t, 1)
        const lineX = t + py * (1 - 2 * t);
        const inDiag = Math.abs(px - lineX) < t * 0.85;

        if (inLeft || inRight || inDiag) {
          pixels[i]   = 229; // #e50914
          pixels[i+1] = 9;
          pixels[i+2] = 20;
          pixels[i+3] = 255;
        }
      }
    }
  }

  return pixels;
}

// ── Generate icons ─────────────────────────────────────────────────────────
console.log('Generating icons...');

// 256×256 PNG (main icon)
const png256 = createPNG(256, 256, drawIcon(256));
fs.writeFileSync(path.join(assetsDir, 'icon.png'), png256);
console.log('✓ assets/icon.png (256×256)');

// 16×16 PNG (tray icon)
const png16 = createPNG(16, 16, drawIcon(16));
fs.writeFileSync(path.join(assetsDir, 'tray.png'), png16);
console.log('✓ assets/tray.png (16×16)');

// ICO file (contains 16×16 and 256×256 PNG)
function createICO(pngBuffers) {
  // ICO header + directory entries
  const count = pngBuffers.length;
  const headerSize = 6 + 16 * count;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: ICO
  header.writeUInt16LE(count, 4); // count

  let offset = headerSize;
  const entries = [];
  for (const png of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry[0] = 0;   // width  (0 = 256)
    entry[1] = 0;   // height (0 = 256)
    entry[2] = 0;   // colors
    entry[3] = 0;   // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

const ico = createICO([png256, png16]);
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), ico);
console.log('✓ assets/icon.ico');

console.log('\nAll icons generated. Replace them with your branded icons before release.');
