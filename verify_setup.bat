@echo off
REM ClimaPredict - Setup Verification Script
REM This script verifies that everything is properly set up

echo ========================================
echo ClimaPredict - Setup Verification
echo ========================================
echo.

set ERROR_COUNT=0

REM Check Flutter
echo [1/8] Checking Flutter...
flutter --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Flutter not found
    set /a ERROR_COUNT+=1
) else (
    echo ✓ Flutter installed
)
echo.

REM Check Node.js
echo [2/8] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Node.js not found
    set /a ERROR_COUNT+=1
) else (
    echo ✓ Node.js installed
)
echo.

REM Check Hive adapters
echo [3/8] Checking Hive adapters...
if exist "lib\models\farmer_profile.g.dart" (
    echo ✓ farmer_profile.g.dart found
) else (
    echo ✗ farmer_profile.g.dart missing
    set /a ERROR_COUNT+=1
)

if exist "lib\models\forecast_cache.g.dart" (
    echo ✓ forecast_cache.g.dart found
) else (
    echo ✗ forecast_cache.g.dart missing
    set /a ERROR_COUNT+=1
)

if exist "lib\models\sensor_reading.g.dart" (
    echo ✓ sensor_reading.g.dart found
) else (
    echo ✗ sensor_reading.g.dart missing
    set /a ERROR_COUNT+=1
)

if exist "lib\models\feedback.g.dart" (
    echo ✓ feedback.g.dart found
) else (
    echo ✗ feedback.g.dart missing
    set /a ERROR_COUNT+=1
)

if exist "lib\models\insurance_claim.g.dart" (
    echo ✓ insurance_claim.g.dart found
) else (
    echo ✗ insurance_claim.g.dart missing
    set /a ERROR_COUNT+=1
)
echo.

REM Check pubspec.lock
echo [4/8] Checking dependencies...
if exist "pubspec.lock" (
    echo ✓ pubspec.lock found
) else (
    echo ✗ pubspec.lock missing - run 'flutter pub get'
    set /a ERROR_COUNT+=1
)
echo.

REM Check backend
echo [5/8] Checking backend...
if exist "backend\package.json" (
    echo ✓ backend/package.json found
) else (
    echo ✗ backend/package.json missing
    set /a ERROR_COUNT+=1
)

if exist "backend\src\server.js" (
    echo ✓ backend/src/server.js found
) else (
    echo ✗ backend/src/server.js missing
    set /a ERROR_COUNT+=1
)
echo.

REM Check documentation
echo [6/8] Checking documentation...
if exist "README.md" (echo ✓ README.md) else (echo ✗ README.md missing)
if exist "ARCHITECTURE.md" (echo ✓ ARCHITECTURE.md) else (echo ✗ ARCHITECTURE.md missing)
if exist "API_SPEC.yaml" (echo ✓ API_SPEC.yaml) else (echo ✗ API_SPEC.yaml missing)
if exist "COMPLETE_SETUP_GUIDE.md" (echo ✓ COMPLETE_SETUP_GUIDE.md) else (echo ✗ COMPLETE_SETUP_GUIDE.md missing)
echo.

REM Run Flutter analyze
echo [7/8] Running Flutter analyze...
call flutter analyze >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Flutter analyze found issues
    set /a ERROR_COUNT+=1
) else (
    echo ✓ Flutter analyze passed
)
echo.

REM Run tests
echo [8/8] Running tests...
call flutter test >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Tests failed
    set /a ERROR_COUNT+=1
) else (
    echo ✓ All tests passed
)
echo.

echo ========================================
if %ERROR_COUNT% equ 0 (
    echo ✓ All checks passed! Setup is complete.
    echo.
    echo You can now:
    echo 1. Run the app: flutter run
    echo 2. Build APK: flutter build apk --release
    echo 3. Start backend: cd backend ^&^& npm run dev
) else (
    echo ✗ Found %ERROR_COUNT% issue(s)
    echo.
    echo Please fix the issues above and run this script again.
    echo For help, see COMPLETE_SETUP_GUIDE.md
)
echo ========================================
echo.
pause
