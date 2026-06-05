# 📱 IKIGAI Mobile App - Deployment Guide

## Build & Deploy Options

### Option 1: EAS Build (Recommended)
Best for production APK/AAB builds

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK (for Android)
eas build --platform android

# Build AAB (for Google Play)
eas build --platform android --type app-bundle
```

### Option 2: Local Build
Build on your machine

```bash
# Install Expo CLI
npm install -g expo-cli

# Build APK locally
npm run android

# Build iOS
npm run ios
```

### Option 3: Expo Go (Testing)
Quick testing without building

```bash
# Start Expo dev server
npm run start

# Scan QR code with Expo Go app
# Or press 'a' for Android/iOS simulator
```

---

## Installation Steps

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli` (for builds)

### Step 1: Clone Repository
```bash
git clone https://github.com/MinaVictor-soft/IKIGAI-Mobile-App.git
cd IKIGAI-Mobile-App
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure API URL
Edit `src/config/constants.ts`:
```typescript
export const PROD_API_URL = 'https://ikigai-app-backend.replit.app/api/v1'
export const DEV_API_URL = 'http://192.168.1.8:3000/api/v1'
```

### Step 4: Run Development Server
```bash
npm run start
```

---

## Features

### 📱 Screens
1. **Splash Screen** - App startup
2. **Loading Screen** - Initial load
3. **Login Screen** - User authentication
4. **Register Screen** - Account creation
5. **Home Screen** - Dashboard
6. **Leaderboard Screen** - Rankings
7. **Quiz List Screen** - Available quizzes
8. **Quiz Play Screen** - Taking quiz
9. **Events Screen** - Event listings
10. **Sports Screen** - Sports tracking
11. **Library Screen** - Resource library
12. **Scanner Screen** - QR code scanning
13. **Profile Screen** - User profile
14. **Info Screen** - App information
15. **Offline Banner** - Connectivity status

### 🎨 UI/UX
- Professional design
- Dark theme
- Bottom tab navigation
- Smooth transitions
- RTL support (Arabic)
- Responsive layout

### 🔐 Security
- JWT authentication
- Secure storage
- API encryption
- Session management

### 📡 Offline Support
- Offline banner
- Local storage caching
- Data persistence
- Sync when online

---

## QR Code Scanning

### Native QR Scanner
Uses native device camera with Expo Camera

```typescript
// In ScannerScreen.tsx
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as Linking from 'expo-linking'

// Handles QR codes automatically
```

### Permissions Required
```
- camera
- camera-roll
- microphone (for video)
```

---

## Configuration

### app.json
```json
{
  "expo": {
    "name": "IKIGAI Quest",
    "slug": "ikigai-quest",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    },
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow IKIGAI to access your camera"
        }
      ]
    ]
  }
}
```

### EAS Build Config (eas.json)
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview2": {
      "android": {
        "buildType": "aab"
      }
    },
    "production": {}
  },
  "cli": {
    "version": ">= 5.4.0"
  }
}
```

---

## Environment Setup

### Android Requirements
- Android SDK 30+
- Gradle 7.x+
- JDK 11+

### iOS Requirements
- iOS 14+
- Xcode 14+
- CocoaPods

### Recommended Tools
- Node.js 18+ LTS
- Watchman (for file watching)
- Android Studio (for Android SDK)
- Xcode (for iOS)

---

## Build Output

### APK (Android)
- File: `app-release.apk`
- Size: ~50-100 MB
- Format: Direct install
- Use for: Testing, Google Play

### AAB (Android Bundle)
- File: `app-release.aab`
- Size: ~40-80 MB
- Format: Play Store optimized
- Use for: Google Play Store

### IPA (iOS)
- File: `app.ipa`
- Size: ~60-120 MB
- Format: Apple format
- Use for: TestFlight, App Store

---

## Testing

### Local Testing
```bash
# Start dev server
npm run start

# Then scan QR with:
# - Expo Go app (easiest)
# - Android Emulator
# - iOS Simulator
```

### Device Testing
1. Install Expo Go app
2. Scan QR code from development server
3. Test all features
4. Verify QR scanning

### Beta Testing
```bash
# Build APK
eas build --platform android --type preview

# Or build via EAS for beta:
eas submit --platform android --latest
```

---

## Distribution

### Google Play Store
1. Build AAB: `eas build --platform android --type app-bundle`
2. Create Google Play Console account
3. Create new app
4. Upload AAB
5. Fill metadata
6. Submit for review

### Apple App Store
1. Build IPA: `eas build --platform ios`
2. Create Apple Developer account
3. Create App ID
4. Configure provisioning
5. Submit for review

### Direct Distribution (APK)
1. Build APK: `eas build --platform android --type preview`
2. Host on website
3. Share download link
4. Users install directly

---

## Troubleshooting

### Issue: "Metro Bundler Failed"
```bash
npm install
npx expo prebuild --clean
npm run start
```

### Issue: "No eligible devices"
```bash
# For Android Emulator
npx expo run:android

# For iOS Simulator
npx expo run:ios
```

### Issue: "QR Code Not Scanning"
- Ensure camera permissions granted
- Check device lighting
- Verify QR code validity
- Test with another QR code

### Issue: "API Connection Failed"
- Verify API URL in constants.ts
- Check backend is running
- Verify network connectivity
- Check firewall settings

### Issue: "Build Failed"
```bash
# Clean build
rm -rf node_modules
npm install
eas build --platform android --clear-cache
```

---

## Performance Tips

1. **Code Splitting**
   - Uses React Navigation lazy loading
   - Optimized bundle size

2. **Image Optimization**
   - Assets already optimized
   - Consider WebP format

3. **Bundle Size**
   - Current: ~40-50 MB (APK)
   - Optimized for mobile networks

4. **Battery Usage**
   - Native camera is efficient
   - Minimal background processes

---

## Dependencies

### Core
- React Native 0.85.3
- Expo 56.0.8
- React Navigation 6.x

### Camera
- expo-camera (QR scanning)
- expo-barcode-scanner

### Storage
- expo-secure-store (secure data)
- AsyncStorage (local data)

### Networking
- Axios (API calls)
- React Query (caching)

### UI
- React Native Vector Icons
- React Native Linear Gradient
- React Native Paper (optional)

---

## Next Steps

1. **Development**
   - Clone repository
   - Install dependencies
   - Run dev server
   - Test features

2. **Testing**
   - Test on device
   - Verify QR scanning
   - Check offline mode
   - Validate API calls

3. **Build**
   - Create signing keys
   - Build APK/AAB
   - Test installation
   - Verify functionality

4. **Distribution**
   - Create store accounts
   - Submit for review
   - Monitor app store
   - Handle updates

---

## API Integration

All API calls use production backend:
```
https://ikigai-app-backend.replit.app/api/v1
```

### Endpoints Used
- `/auth/*` - Authentication
- `/users/*` - User management
- `/quiz/*` - Quiz management
- `/attendance/*` - QR scanning
- `/leaderboard/*` - Rankings
- `/xp/*` - XP tracking

---

## Support

For issues or questions:
1. Check error logs in terminal
2. Verify API connectivity
3. Check GitHub issues
4. Review Expo documentation

---

**Mobile App is ready for build and deployment! 📱🚀**
