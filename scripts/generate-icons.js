/**
 * Icon Generation Helper Script
 * 
 * This script provides instructions for generating app icons.
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

console.log('📱 BRSConnect App Icon Setup\n');
console.log('This script helps you understand the icon requirements.\n');

const androidSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

const ioSizes = [
  { name: '20x20@2x', size: 40 },
  { name: '20x20@3x', size: 60 },
  { name: '29x29@2x', size: 58 },
  { name: '29x29@3x', size: 87 },
  { name: '40x40@2x', size: 80 },
  { name: '40x40@3x', size: 120 },
  { name: '60x60@2x', size: 120 },
  { name: '60x60@3x', size: 180 },
  { name: '1024x1024', size: 1024 },
];

console.log('📦 Android Icon Requirements:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
androidSizes.forEach(({ folder, size }) => {
  const exists = fs.existsSync(path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', folder));
  const status = exists ? '✓' : '✗';
  console.log(`  ${status} ${folder.padEnd(20)} ${size}x${size} px`);
});
console.log('\n  Location: android/app/src/main/res/mipmap-*/');
console.log('  Files needed: ic_launcher.png, ic_launcher_round.png\n');

console.log('🍎 iOS Icon Requirements:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
ioSizes.forEach(({ name, size }) => {
  console.log(`  • ${name.padEnd(15)} ${size}x${size} px`);
});
console.log('\n  Location: ios/BRSConnect/Images.xcassets/AppIcon.appiconset/\n');

console.log('🚀 Quick Start:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('1. Get your BRSConnect logo (1024x1024 px recommended)');
console.log('2. Use an online tool: https://www.appicon.co/');
console.log('3. Upload your logo and download the generated icons');
console.log('4. Copy Android icons to: android/app/src/main/res/mipmap-*/');
console.log('5. Copy iOS icons to: ios/BRSConnect/Images.xcassets/AppIcon.appiconset/');
console.log('6. Rebuild your app\n');

console.log('📝 See APP_ICON_SETUP.md for detailed instructions.\n');

