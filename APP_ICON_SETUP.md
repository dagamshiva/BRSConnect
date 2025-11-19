# App Icon Setup Guide

This guide explains how to set up the BRSConnect app icon for both Android and iOS.

## Overview

The app icon needs to be placed in platform-specific directories with multiple sizes for different screen densities.

## Required Icon Sizes

### Android Icons
You need to create icons in the following sizes and place them in `android/app/src/main/res/`:

- **mipmap-mdpi**: 48x48 px (ic_launcher.png, ic_launcher_round.png)
- **mipmap-hdpi**: 72x72 px
- **mipmap-xhdpi**: 96x96 px
- **mipmap-xxhdpi**: 144x144 px
- **mipmap-xxxhdpi**: 192x192 px

### iOS Icons
You need to create icons in the following sizes and place them in `ios/BRSConnect/Images.xcassets/AppIcon.appiconset/`:

- **20x20@2x**: 40x40 px
- **20x20@3x**: 60x60 px
- **29x29@2x**: 58x58 px
- **29x29@3x**: 87x87 px
- **40x40@2x**: 80x80 px
- **40x40@3x**: 120x120 px
- **60x60@2x**: 120x120 px
- **60x60@3x**: 180x180 px
- **1024x1024**: 1024x1024 px (App Store icon)

## Quick Setup Steps

### Option 1: Using Online Icon Generator (Recommended)

1. Visit an icon generator like:
   - https://www.appicon.co/
   - https://icon.kitchen/
   - https://makeappicon.com/

2. Upload your BRSConnect logo (the pink square with white icon and text)

3. Download the generated icon sets

4. Extract and copy the files:
   - **Android**: Copy all `ic_launcher.png` and `ic_launcher_round.png` files to their respective `mipmap-*` folders
   - **iOS**: Copy all icon files to `ios/BRSConnect/Images.xcassets/AppIcon.appiconset/` and update `Contents.json`

### Option 2: Manual Setup

1. Start with a 1024x1024 px source image of your BRSConnect logo

2. Use an image editor or tool to generate all required sizes

3. Replace the existing icon files in:
   - `android/app/src/main/res/mipmap-*/ic_launcher.png`
   - `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
   - `ios/BRSConnect/Images.xcassets/AppIcon.appiconset/*.png`

## Icon Specifications

- **Format**: PNG (with transparency if needed)
- **Background**: The icon should have the pink background as shown in the logo
- **Shape**: 
  - Android: Square (will be automatically rounded by the system)
  - iOS: Square (can be rounded or square based on your design)

## After Setup

1. **Android**: Rebuild the app
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

2. **iOS**: Clean and rebuild
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

## Notes

- The icon should be recognizable at small sizes
- Ensure the "BRSConnect" text is readable at all sizes
- The pink background color should match your brand (#E91E63 or similar)
- Test the icon on actual devices to ensure it looks good

## Current Icon Locations

- **Android**: `android/app/src/main/res/mipmap-*/`
- **iOS**: `ios/BRSConnect/Images.xcassets/AppIcon.appiconset/`

