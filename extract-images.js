const sharp = require('sharp');
const fs = require('fs');

async function extractImages() {
  const inputFile = 'public/PAGE 31.png';
  
  if (!fs.existsSync(inputFile)) {
    console.error('File not found:', inputFile);
    return;
  }

  // The browser subagent found the grid starts around x=1370, y=460.
  // We'll crop 4 images from the right side of PAGE 31.png
  // Left column (Image 1 & Image 2)
  await sharp(inputFile)
    .extract({ left: 1370, top: 460, width: 500, height: 500 })
    .toFile('public/images/about_1.png');

  await sharp(inputFile)
    .extract({ left: 1370, top: 1000, width: 500, height: 600 })
    .toFile('public/images/about_2.png');

  // Right column (Image 3 & Image 4)
  await sharp(inputFile)
    .extract({ left: 1930, top: 460, width: 500, height: 600 })
    .toFile('public/images/about_3.png');

  await sharp(inputFile)
    .extract({ left: 1930, top: 1100, width: 500, height: 500 })
    .toFile('public/images/about_4.png');

  console.log('Successfully extracted 4 images from PAGE 31.png');
}

extractImages().catch(console.error);
