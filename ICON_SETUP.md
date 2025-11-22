# App Icon Setup

The BRS logo has been set as the Android app launcher icon.

## Generated Icons

All Android launcher icons have been generated from `src/assets/brs-logo.png`:

- **Regular icons** (`ic_launcher.png`):
  - mdpi: 48x48
  - hdpi: 72x72
  - xhdpi: 96x96
  - xxhdpi: 144x144
  - xxxhdpi: 192x192

- **Round icons** (`ic_launcher_round.png`):
  - Same sizes as above (will be automatically clipped to circular shape by Android)

## Location

Icons are located in:
```
android/app/src/main/res/mipmap-*/
```

## Configuration

The Android manifest (`android/app/src/main/AndroidManifest.xml`) is already configured to use:
- `android:icon="@mipmap/ic_launcher"` - Regular icon
- `android:roundIcon="@mipmap/ic_launcher_round"` - Round icon

## To Apply Changes

After generating new icons, you need to clean and rebuild the Android app:

```bash
# Clean Android build
cd android
./gradlew clean
cd ..

# Rebuild and run
npm run android
```

Or on Windows:
```bash
cd android
gradlew.bat clean
cd ..
npm run android
```

## Regenerating Icons

If you need to regenerate icons from the source logo:

```bash
npm run generate-icons
```

This will regenerate all Android launcher icons from `src/assets/brs-logo.png`.

## iOS Icons

For iOS icons, you'll need to manually replace the icons in:
```
ios/BRSConnect/Images.xcassets/AppIcon.appiconset/
```

Or use Xcode's AppIcon asset catalog to import the source image.
