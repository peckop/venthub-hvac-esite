const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const imagesDir = path.join(__dirname, '..', '..', 'public', 'images');

const imagesToConvert = [
  'hero_hvac_industrial_premium_1.png',
  'hvac_installation_close_up_premium_3.png',
  'vortice_lineo_futuristic.png',
  'industrial_fan_vortice_style_premium_2.png'
];

async function convert() {
  for (const filename of imagesToConvert) {
    const inputPath = path.join(imagesDir, filename);
    const outputFilename = filename.replace('.png', '.webp');
    const outputPath = path.join(imagesDir, outputFilename);

    if (fs.existsSync(inputPath)) {
      console.log(`Converting ${filename} to WebP...`);
      try {
        await sharp(inputPath)
          .webp({ quality: 80 }) // 80 quality is very good for web, visually lossless but tiny
          .toFile(outputPath);
        
        const originalSize = fs.statSync(inputPath).size;
        const newSize = fs.statSync(outputPath).size;
        console.log(`Success: ${outputFilename}`);
        console.log(`Original Size: ${(originalSize / 1024).toFixed(2)} KB -> WebP Size: ${(newSize / 1024).toFixed(2)} KB (Saved ${((originalSize - newSize) / 1024).toFixed(2)} KB)`);
      } catch (err) {
        console.error(`Error converting ${filename}:`, err);
      }
    } else {
      console.warn(`File not found: ${inputPath}`);
    }
  }
}

convert();
