# SnapLog AI Vision

> **Vision-to-form AI inventory for React Native** — photograph any item, get structured AI analysis, and save it to a searchable catalog in under 10 seconds.

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?logo=react&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.9.0-FFCA28?logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **AI-powered cataloging** — Tap, photograph, and get title, category, color, and condition extracted automatically via Gemini 2.5 Flash
- **Review & edit** — Confirm or correct AI suggestions before saving
- **Offline-first** — Draft queue with automatic retry syncs items when connectivity is restored
- **CSV export** — Share your full inventory as a CSV file via the native share sheet
- **Google Sign-In + anonymous fallback** — Users can start immediately without an account
- **Rate limiting** — 20 AI requests per hour per user, enforced server-side in Cloud Functions

---

## App Screenshots

> _Add screenshots or GIFs here after building the app._
>
> Recommended: Camera screen → AI analysis loading → Review form → Dashboard card

---

## Architecture

```
UI (React Native / Expo)
  └─ Stores (Zustand + MMKV persistence)
       └─ Services (Firebase SDK)
            ├─ Firestore  ─────────────────────────────┐
            ├─ Cloud Storage                           │
            └─ Cloud Functions (HTTPS callable)        │
                 └─ Gemini 2.5 Flash (Google AI) ──────┘
```

---

## Prerequisites

| Tool           | Version  | Notes                                |
| -------------- | -------- | ------------------------------------ |
| Node.js        | 20 (LTS) | Use `nvm use` — `.nvmrc` is provided |
| npm            | ≥ 10     | Bundled with Node 20                 |
| Expo CLI       | latest   | `npm install -g expo-cli`            |
| Firebase CLI   | latest   | `npm install -g firebase-tools`      |
| Android Studio | latest   | For Android emulator                 |
| Xcode          | ≥ 15     | For iOS simulator (macOS only)       |

---

## Setup

### 1. Clone and install dependencies

```sh
git clone https://github.com/AvishkaGihan/snaplog-ai-vision.git
cd snaplog-ai-vision

# Use the correct Node version
nvm install   # reads .nvmrc automatically
nvm use

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

Create a `.env.local` file at the project root (never commit this file):

```env
# Firebase client config — found in Firebase console → Project settings → Your apps
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Google OAuth — found in Firebase console → Authentication → Sign-in method → Google
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
```

For the Cloud Function, set the Gemini API key as a Firebase Function secret:

```sh
firebase functions:secrets:set GEMINI_API_KEY
# Paste your key from aistudio.google.com when prompted
```

### 4. Deploy Cloud Functions

```sh
cd functions
npm run build
firebase deploy --only functions
```

### 5. Start the development server

```sh
# From the project root
npx expo start

# Run on a specific platform
npx expo run:android
npx expo run:ios
```

---

## Running Cloud Functions Locally

```sh
cd functions
firebase emulators:start --only functions
```

Set `FUNCTIONS_EMULATOR=true` in your environment to point the app at the local emulator.

---

## Available Scripts

| Command                             | Description                       |
| ----------------------------------- | --------------------------------- |
| `npm start`                         | Start Expo dev server             |
| `npm run android`                   | Run on Android                    |
| `npm run ios`                       | Run on iOS                        |
| `npm run lint`                      | Run ESLint on `src/`              |
| `npm run typecheck`                 | TypeScript type check (root)      |
| `cd functions && npm run build`     | Compile Cloud Functions           |
| `cd functions && npm test`          | Run Cloud Functions unit tests    |
| `cd functions && npm run typecheck` | TypeScript type check (functions) |

---

## Environment Variables Reference

| Variable                                   | Required      | Description                         |
| ------------------------------------------ | ------------- | ----------------------------------- |
| `EXPO_PUBLIC_FIREBASE_API_KEY`             | ✅            | Firebase web API key                |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`         | ✅            | Firebase Auth domain                |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID`          | ✅            | Firestore project ID                |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`      | ✅            | Cloud Storage bucket                |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅            | Firebase Messaging sender           |
| `EXPO_PUBLIC_FIREBASE_APP_ID`              | ✅            | Firebase App ID                     |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`         | ✅            | Google OAuth web client ID          |
| `GEMINI_API_KEY`                           | ✅ (Cloud Fn) | Gemini AI API key (Firebase secret) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, coding standards, and PR instructions.

---

## License

[MIT](LICENSE) © 2026 SnapLog AI Vision Contributors
