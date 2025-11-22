/**
 * Script to generate Android app icons from brs-logo.png
 * 
 * This script generates all required icon sizes for Android launcher icons
 * from the source BRS logo image.
 * 
 * Required sizes:
 * - mdpi: 48x48
 * - hdpi: 72x72
 * - xhdpi: 96x96
 * - xxhdpi: 144x144
 * - xxxhdpi: 192x192
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise provide instructions
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('❌ Error: sharp package is required to generate icons.');
  console.error('   Please install it first: npm install --save-dev sharp');
  console.error('\n   Or use an online icon generator:');
  console.error('   https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html');
  process.exit(1);
}

const sourceLogo = path.join(__dirname, '../src/assets/brs-logo.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');

// Icon sizes for different densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateIcons() {
  try {
    // Check if source logo exists
    if (!fs.existsSync(sourceLogo)) {
      console.error(`❌ Error: Source logo not found at ${sourceLogo}`);
      process.exit(1);
    }

    console.log('🔄 Generating Android app icons from BRS logo...\n');

    // Generate icons for each density
    for (const [density, size] of Object.entries(iconSizes)) {
      const densityPath = path.join(androidResPath, density);
      
      // Ensure directory exists
      if (!fs.existsSync(densityPath)) {
        fs.mkdirSync(densityPath, { recursive: true });
      }

      // Generate regular icon
      const regularIconPath = path.join(densityPath, 'ic_launcher.png');
      await sharp(sourceLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .toFile(regularIconPath);
      
      console.log(`✅ Generated ${density}/ic_launcher.png (${size}x${size})`);

      // Generate round icon (same size, will be clipped by Android)
      const roundIconPath = path.join(densityPath, 'ic_launcher_round.png');
      await sharp(sourceLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .toFile(roundIconPath);
      
      console.log(`✅ Generated ${density}/ic_launcher_round.png (${size}x${size})`);
    }

    console.log('\n✨ All Android app icons generated successfully!');
    console.log('\n📱 Next steps:');
    console.log('   1. Clean and rebuild your Android app');
    console.log('   2. Run: cd android && ./gradlew clean && cd ..');
    console.log('   3. Run: npm run android');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();