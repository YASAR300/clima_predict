@echo off
REM ClimaPredict - Automated Setup Script for Windows
REM This script sets up the entire project

echo ========================================
echo ClimaPredict - Automated Setup
echo ========================================
echo.

REM Check if Flutter is installed
echo [1/6] Checking Flutter installation...
flutter --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Flutter is not installed or not in PATH
    echo Please install Flutter from: https://flutter.dev
    pause
    exit /b 1
)
echo ✓ Flutter found
echo.

REM Clean previous builds
echo [2/6] Cleaning previous builds...
call flutter clean
if %errorlevel% neq 0 (
    echo ERROR: Flutter clean failed
    pause
    exit /b 1
)
echo ✓ Clean completed
echo.

REM Get dependencies
echo [3/6] Getting Flutter dependencies...
call flutter pub get
if %errorlevel% neq 0 (
    echo ERROR: Failed to get dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Generate Hive adapters
echo [4/6] Generating Hive adapters (this may take 30-60 seconds)...
call flutter pub run build_runner build --delete-conflicting-outputs
if %errorlevel% neq 0 (
    echo ERROR: Failed to generate Hive adapters
    pause
    exit /b 1
)
echo ✓ Hive adapters generated
echo.

REM Run analysis
echo [5/6] Running Flutter analyze...
call flutter analyze
if %errorlevel% neq 0 (
    echo WARNING: Flutter analyze found issues
    echo Please review the output above
    pause
)
echo ✓ Analysis completed
echo.

REM Run tests
echo [6/6] Running tests...
call flutter test
if %errorlevel% neq 0 (
    echo WARNING: Some tests failed
    echo Please review the output above
    pause
)
echo ✓ Tests completed
echo.

echo ========================================
echo Setup Complete! ✓
echo ========================================
echo.
echo Next steps:
echo 1. To run the app: flutter run
echo 2. To build APK: flutter build apk --release
echo 3. To start backend: cd backend ^&^& npm install ^&^& npm run dev
echo.
echo For detailed instructions, see COMPLETE_SETUP_GUIDE.md
echo.
pause
