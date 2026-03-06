<div align="center">

<!-- Replace the line below with your own banner image: assets/images/banner.png -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:6C63FF,100:4285F4&height=200&section=header&text=SnapLog%20AI%20Vision&fontSize=48&fontColor=ffffff&fontAlignY=38&desc=Vision-to-form%20AI%20inventory%20for%20mobile&descAlignY=58&descSize=18" width="100%" alt="SnapLog AI Vision Banner" />

<br/>

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-12.9.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

**Photograph any item. Get instant AI analysis. Build your searchable catalog — in under 10 seconds.**

<br/>

[Features](#-features) · [Screenshots](#-screenshots) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Setup](#-setup) · [Contributing](#-contributing)

<br/>

</div>

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h3>📸 AI-Powered Cataloging</h3>
      Tap, photograph, and get <strong>title, category, color, and condition</strong> extracted automatically via Gemini 2.5 Flash — the entire flow completes in under 10 seconds.
    </td>
    <td width="50%">
      <h3>✏️ Review & Edit</h3>
      Every AI suggestion is shown on a pre-filled review form. Confirm accurate fields instantly or correct any detail before saving — you're always in control.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>📡 Offline-First</h3>
      No connection? No problem. Items are queued locally with <strong>MMKV-backed persistence</strong> and automatically synced to Firestore when connectivity is restored.
    </td>
    <td width="50%">
      <h3>📊 CSV Export</h3>
      Share your full inventory as a CSV file in one tap via the native share sheet — ready for spreadsheets, resale platforms, or archiving.
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🔐 Flexible Auth</h3>
      <strong>Google Sign-In</strong> for persistent accounts and an <strong>anonymous fallback</strong> so users can start cataloging immediately without an account.
    </td>
    <td width="50%">
      <h3>🛡️ Rate Limiting</h3>
      20 AI requests per hour per user, enforced <strong>server-side</strong> in Cloud Functions — keeps costs predictable and the service fair.
    </td>
  </tr>
</table>

---

## 📱 Screenshots

> Add your own screenshots by replacing the placeholders below.
> Recommended flow: **Camera → Scan Loading → Review Form → Dashboard → Item Detail → Settings**

<div align="center">

|                                Camera Screen                                |                                AI Scan Loading                                 |                                Review Form                                |
| :-------------------------------------------------------------------------: | :----------------------------------------------------------------------------: | :-----------------------------------------------------------------------: |
| <img src="docs/images/screen-camera.png" width="220" alt="Camera Screen" /> | <img src="docs/images/screen-loading.png" width="220" alt="AI Scan Loading" /> | <img src="docs/images/screen-review.png" width="220" alt="Review Form" /> |
|                          Point camera at any item                           |                      Gemini 2.5 Flash analyzes the photo                       |                     Pre-filled form ready to confirm                      |

|                                 Dashboard                                  |                                Item Detail                                |                                 Settings                                 |
| :------------------------------------------------------------------------: | :-----------------------------------------------------------------------: | :----------------------------------------------------------------------: |
| <img src="docs/images/screen-dashboard.png" width="220" alt="Dashboard" /> | <img src="docs/images/screen-detail.png" width="220" alt="Item Detail" /> | <img src="docs/images/screen-settings.png" width="220" alt="Settings" /> |
|                        Search & browse your catalog                        |                        Full item record with photo                        |                       Auth, export & sync controls                       |

</div>

> 💡 **Tip:** Record a short GIF of the full flow (camera → save) and add it here as `docs/images/demo.gif` for maximum impact.

---

## 🏗️ Architecture

SnapLog uses a **strict layered architecture** — the UI never talks directly to Firebase or Gemini. All AI inference happens server-side inside a Cloud Function, keeping the Gemini API key off the device entirely.

```
┌─────────────────────────────────────────────────┐
│          UI  (React Native / Expo)              │
│   Screens · Navigation · Components             │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         State  (Zustand + MMKV persist)         │
│   useItemStore · useAuthStore · useNetworkStore  │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│            Services  (Firebase SDK)             │
│  aiService · firestoreService · storageService  │
│        authService · syncService · csvService   │
└───────┬───────────────┬───────────────┬─────────┘
        │               │               │
   Firestore     Cloud Storage    Cloud Functions
        │                               │
        └───────────────────────────────┤
                                        │
                              ┌─────────▼─────────┐
                              │  Gemini 2.5 Flash  │
                              │  (Google AI API)   │
                              └───────────────────┘
```

### Data Flow — Scan to Save

```
User taps Scan
    → expo-camera captures frame
    → expo-image-manipulator compresses to <500 KB
    → analyzeItem Cloud Function (HTTPS callable)
        → rate limiter checks (20 req/hr/user — Firestore)
        → Gemini 2.5 Flash multimodal analysis
        → Zod validates JSON response
        → structured ItemAnalysis returned
    → ReviewFormScreen pre-populated
    → User confirms / edits
    → Image uploaded to Cloud Storage
    → Item document written to Firestore
    → Dashboard updated via Zustand store
```

---

## 🛠️ Tech Stack

<details>
<summary><strong>Frontend (React Native / Expo)</strong></summary>

| Category         | Library                                   | Version  |
| ---------------- | ----------------------------------------- | -------- |
| Framework        | Expo (managed workflow)                   | SDK 54   |
| Runtime          | React Native                              | 0.81.5   |
| Language         | TypeScript (strict)                       | ~5.9.2   |
| State            | Zustand                                   | 5.0.11   |
| Storage          | react-native-mmkv                         | ^4.1.2   |
| Navigation       | React Navigation (Stack + Tabs)           | 7.x      |
| UI Primitives    | React Native Paper (Material 3)           | 5.15.0   |
| Camera           | expo-camera                               | ~17.0.10 |
| Image Processing | expo-image-manipulator                    | ~14.0.8  |
| Auth             | @react-native-google-signin/google-signin | ^13.1.0  |
| Network          | @react-native-community/netinfo           | 11.4.1   |
| Validation       | Zod                                       | ^3.25.76 |

</details>

<details>
<summary><strong>Backend (Firebase Cloud Functions — Node.js 20)</strong></summary>

| Category   | Library                                  | Version |
| ---------- | ---------------------------------------- | ------- |
| Runtime    | Node.js                                  | 20 LTS  |
| Functions  | firebase-functions                       | ^6.0.1  |
| Admin SDK  | firebase-admin                           | ^12.7.0 |
| AI         | @google/generative-ai (Gemini 2.5 Flash) | ^0.24.1 |
| Validation | Zod                                      | ^4.3.0  |
| Testing    | Jest + ts-jest                           | ^30.2.0 |

</details>

<details>
<summary><strong>Infrastructure</strong></summary>

| Service         | Purpose                             |
| --------------- | ----------------------------------- |
| Firebase Auth   | Google Sign-In + anonymous sessions |
| Firestore       | Item catalog + rate limit counters  |
| Cloud Storage   | Item photos                         |
| Cloud Functions | AI analysis, rate limiting          |
| GitHub Actions  | Lint + TypeScript type-check CI     |

</details>

---

## 🚀 Setup

### Prerequisites

| Tool           | Version  | Notes                                |
| -------------- | -------- | ------------------------------------ |
| Node.js        | 20 (LTS) | Use `nvm use` — `.nvmrc` is provided |
| npm            | ≥ 10     | Bundled with Node 20                 |
| Expo CLI       | latest   | `npm install -g expo-cli`            |
| Firebase CLI   | latest   | `npm install -g firebase-tools`      |
| Android Studio | latest   | For Android emulator                 |
| Xcode          | ≥ 15     | For iOS simulator (macOS only)       |

### 1. Clone and install

```sh
git clone https://github.com/AvishkaGihan/snaplog-ai-vision.git
cd snaplog-ai-vision

# Install root dependencies
npm install

# Install Cloud Functions dependencies
cd functions && npm install && cd ..
```

### 2. Configure Firebase

```sh
# Log in to Firebase
firebase login

# Select your project (or create one at console.firebase.google.com)
firebase use --add
```

### 3. Set environment variables

Create a `.env.local` file at the project root — **never commit this file**:

```env
# Firebase client config — Firebase console → Project Settings → Your Apps
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google OAuth — Firebase console → Authentication → Sign-in method → Google
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

Set the Gemini API key as a Firebase secret (keeps it off the client entirely):

```sh
firebase functions:secrets:set GEMINI_API_KEY
# Paste your key from aistudio.google.com when prompted
```

> Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

### 4. Deploy Cloud Functions

```sh
cd functions
npm run build
firebase deploy --only functions
```

### 5. Start the development server

```sh
npx expo start

# Or target a specific platform:
npx expo run:android
npx expo run:ios
```

---

## 🧪 Local Development

### Run Cloud Functions locally

```sh
cd functions
firebase emulators:start --only functions
```

Set `FUNCTIONS_EMULATOR=true` in your local environment to point the app at the local emulator instead of production.

### Run tests

```sh
cd functions
npm test
```

---

## 📜 Available Scripts

| Command                             | Description                        |
| ----------------------------------- | ---------------------------------- |
| `npm start`                         | Start Expo dev server              |
| `npm run android`                   | Run on Android emulator / device   |
| `npm run ios`                       | Run on iOS simulator (macOS only)  |
| `npm run lint`                      | Run ESLint across `src/`           |
| `npm run typecheck`                 | TypeScript type-check (root)       |
| `cd functions && npm run build`     | Compile Cloud Functions TypeScript |
| `cd functions && npm test`          | Run Cloud Functions unit tests     |
| `cd functions && npm run typecheck` | TypeScript type-check (functions)  |

---

## 🔑 Environment Variables Reference

| Variable                                   | Required         | Description                                       |
| ------------------------------------------ | ---------------- | ------------------------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | ✅               | Firebase web API key                              |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | ✅               | Firebase Auth domain                              |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | ✅               | Firestore project ID                              |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | ✅               | Cloud Storage bucket                              |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅               | Firebase Messaging sender                         |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | ✅               | Firebase App ID                                   |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`         | ✅               | Google OAuth web client ID                        |
| `GEMINI_API_KEY`                           | ✅ Cloud Fn only | Gemini API key (Firebase secret, never in `.env`) |

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, branching strategy, coding standards, and PR instructions.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

[MIT](LICENSE) © 2026 [AvishkaGihan](https://github.com/AvishkaGihan)

<div align="center">

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:4285F4,100:6C63FF&height=100&section=footer" width="100%" alt="Footer" />

</div>
