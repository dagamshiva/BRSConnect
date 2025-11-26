@echo off
echo ========================================
echo Building BRSConnect Release APK
echo ========================================
echo.

echo Step 1: Cleaning previous builds...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo Error: Clean failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Building Release APK...
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo Error: Build failed!
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo APK Location:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo NOTE: This APK is signed with the debug keystore.
echo For production releases, you should use your own release keystore.
echo See: https://reactnative.dev/docs/signed-apk-android
echo.
pause

