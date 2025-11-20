@echo off
echo ========================================
echo Building BRSConnect APK for Android
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
echo Step 2: Building Debug APK...
call gradlew assembleDebug
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
echo android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now transfer this APK to your Android device and install it.
echo.
pause


