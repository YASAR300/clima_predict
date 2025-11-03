# ClimaPredict - Complete Setup & Build Guide

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- Flutter SDK (3.7+)
- Android Studio / VS Code
- Node.js 18+ (for backend)
- Git

---

## 📱 **Mobile App Setup**

### Step 1: Clone & Install Dependencies
```bash
cd e:\ClimaPredict\clima_predict
flutter clean
flutter pub get
```

### Step 2: Generate Hive Adapters (CRITICAL!)
```bash
flutter pub run build_runner build --delete-conflicting-outputs
```
**This generates:**
- `lib/models/farmer_profile.g.dart`
- `lib/models/forecast_cache.g.dart`
- `lib/models/sensor_reading.g.dart`
- `lib/models/feedback.g.dart`
- `lib/models/insurance_claim.g.dart`

**⚠️ Without this step, app will crash with Hive adapter errors!**

### Step 3: Verify Setup
```bash
flutter analyze
# Expected: No issues found!

flutter test
# Expected: All tests passed!
```

### Step 4: Build APK
```bash
# For multiple APKs (recommended - smaller size)
flutter build apk --release --split-per-abi

# For single universal APK
flutter build apk --release

# Output location:
# build/app/outputs/flutter-apk/
```

---

## 🖥️ **Backend Setup**

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Environment
Create `.env` file in `backend/` directory:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/climapredict
JWT_SECRET=your-secret-key-here
OPENWEATHER_API_KEY=your-api-key
NASA_API_KEY=your-api-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=climapredict-models
NODE_ENV=development
```

### Step 3: Start Backend
```bash
# Development mode
npm run dev

# Production mode
npm start

# Backend runs at: http://localhost:3000
```

### Step 4: Test Backend
```bash
# Health check
curl http://localhost:3000/health

# Expected: {"status":"ok","timestamp":"..."}
```

---

## 🔧 **Common Issues & Fixes**

### Issue 1: Hive Adapter Error
**Error:** `Uncaught Error` or `Type 'FarmerProfile' is not a subtype`

**Fix:**
```bash
flutter pub run build_runner build --delete-conflicting-outputs
flutter clean
flutter pub get
```

### Issue 2: TFLite Package Error
**Error:** `UnmodifiableUint8ListView not defined`

**Status:** ✅ Already fixed - package commented out in `pubspec.yaml`

**Workaround:** App uses fallback prediction model

### Issue 3: Workmanager Build Error
**Error:** `Unresolved reference 'shim'`

**Status:** ✅ Already fixed - package commented out

**Workaround:** Manual sync available (no background sync)

### Issue 4: Backend Not Connecting
**Fix:**
1. Check backend is running: `curl http://localhost:3000/health`
2. Update API URL in app: `lib/config/api_config.dart`
3. For Android emulator, use: `http://10.0.2.2:3000`
4. For physical device, use: `http://YOUR_IP:3000`

---

## 📋 **Complete Build Checklist**

### Before Building:
- [ ] Run `flutter clean`
- [ ] Run `flutter pub get`
- [ ] Run `flutter pub run build_runner build --delete-conflicting-outputs`
- [ ] Run `flutter analyze` (should show 0 issues)
- [ ] Run `flutter test` (should pass all tests)

### Build Commands:
```bash
# Android APK (split by architecture)
flutter build apk --release --split-per-abi

# Android APK (universal)
flutter build apk --release

# Android App Bundle (for Play Store)
flutter build appbundle --release

# iOS (requires Mac)
flutter build ios --release

# Web
flutter build web --release
```

### Output Locations:
- **APK:** `build/app/outputs/flutter-apk/`
- **AAB:** `build/app/outputs/bundle/release/`
- **iOS:** `build/ios/iphoneos/`
- **Web:** `build/web/`

---

## 🚀 **Running the App**

### On Emulator/Simulator:
```bash
# Android
flutter run

# iOS (Mac only)
flutter run -d ios

# Web
flutter run -d chrome
```

### On Physical Device:
```bash
# List connected devices
flutter devices

# Run on specific device
flutter run -d <device-id>
```

---

## 🧪 **Testing**

### Unit Tests:
```bash
flutter test
```

### Widget Tests:
```bash
flutter test test/widget_test.dart
```

### Integration Tests:
```bash
flutter drive --target=test_driver/app.dart
```

---

## 📦 **What's Included**

### Mobile App Features:
✅ Offline-first architecture  
✅ Hive local database  
✅ 7-day weather forecasts (fallback model)  
✅ BLE sensor integration  
✅ Manual sync capability  
✅ Insurance claim predictor  
✅ Hindi/English localization  
✅ Material Design 3 UI  

### Backend Features:
✅ Node.js + Express API  
✅ MongoDB database  
✅ JWT authentication  
✅ OpenWeather integration  
✅ NASA MODIS data pipeline  
✅ Sensor data ingestion  
✅ Model serving (S3)  
✅ RESTful API endpoints  

### Documentation:
✅ README.md - Project overview  
✅ ARCHITECTURE.md - System design  
✅ API_SPEC.yaml - OpenAPI specification  
✅ BUILD_COMPATIBILITY_NOTES.md - Known issues  
✅ CONTRIBUTING.md - Contribution guidelines  
✅ CODE_OF_CONDUCT.md - Community standards  
✅ SECURITY.md - Security policies  

---

## 🔐 **Environment Variables**

### Mobile App (.env):
```env
API_BASE_URL=http://10.0.2.2:3000
ENABLE_LOGGING=true
```

### Backend (.env):
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/climapredict
JWT_SECRET=your-secret-key
OPENWEATHER_API_KEY=your-key
NASA_API_KEY=your-key
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=climapredict-models
NODE_ENV=development
```

---

## 📊 **Project Status**

| Component | Status |
|-----------|--------|
| Flutter App | ✅ Working |
| Hive Database | ✅ Working |
| Backend API | ✅ Working |
| Tests | ✅ Passing |
| Analysis | ✅ Clean |
| APK Build | ✅ Ready |
| Documentation | ✅ Complete |

---

## 🐛 **Known Limitations**

1. **TFLite Package:** Commented out due to SDK compatibility
   - **Impact:** Uses fallback prediction model
   - **Future:** Will use `tflite_flutter_plus` or wait for update

2. **Workmanager Package:** Commented out due to build errors
   - **Impact:** No automatic background sync
   - **Workaround:** Manual sync button available

3. **BLE Sensors:** Requires physical hardware
   - **Testing:** Use mock data in development

---

## 📞 **Support**

For issues or questions:
1. Check `BUILD_COMPATIBILITY_NOTES.md`
2. Review `ARCHITECTURE.md`
3. Check API documentation: `API_SPEC.yaml`
4. Contact: yasar.khan.cg@gmail.com

---

## 🎉 **Success Criteria**

Your setup is complete when:
- ✅ `flutter analyze` shows 0 issues
- ✅ `flutter test` passes all tests
- ✅ App runs on emulator/device
- ✅ Backend responds to health check
- ✅ APK builds successfully

---

**Last Updated:** 2025-11-03  
**Version:** 1.0.0  
**Status:** Production Ready
