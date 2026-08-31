import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#2563EB" />
  <g transform="translate(19, 19) scale(2.214)" fill="none" stroke="#FFFFFF" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 13.5a9.5 9.5 0 0 1-1.02 4.3 9.63 9.63 0 0 1-8.62 5.33 9.5 9.5 0 0 1-4.3-.1L4 24l2.15-6.46A9.5 9.5 0 0 1 5.12 13.2a9.63 9.63 0 0 1 5.33-8.62A9.5 9.5 0 0 1 14.75 4h.57a9.61 9.61 0 0 1 9.07 9.07v.43z" stroke-width="1.8" />
    <path d="M11 9.5h6" stroke-width="2.2" />
    <path d="M11 14.5h4" stroke-width="2.2" />
    <path d="M11 9.5v8" stroke-width="2.2" />
  </g>
</svg>
`;

async function main() {
  const baseDir = process.cwd();
  const pubDir = path.join(baseDir, 'public');
  const imgDir = path.join(pubDir, 'assets/images');

  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(pubDir, 'favicon.svg'), svgContent);
  fs.writeFileSync(path.join(imgDir, 'favicon.svg'), svgContent);

  const svgBuffer = Buffer.from(svgContent);

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'favicon-180x180.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(imgDir, name));
    console.log(`Generated ${name}`);
  }

  const icoBuffer = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(pubDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(imgDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico');
}

main().catch(console.error);
