# FrameFinder Firebase Setup

## Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- A Google account

---

## Step 1 — Clone and Install

```bash
git clone <your-repo-url>
cd framefinder
npm install
```

---

## Step 2 — Create Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it **FrameFinder**
3. Disable Google Analytics (optional) → **Create project**

---

## Step 3 — Register a Web App

1. In the Firebase console, click the **</>** (Web) icon
2. App nickname: **FrameFinder Web**
3. Click **Register app**
4. Copy the `firebaseConfig` object shown

---

## Step 4 — Add Credentials to the App

Open `firebase/config.ts` and replace all `YOUR_*` placeholders with the values from Step 3:

```typescript
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',           // ← replace
  authDomain: 'YOUR_AUTH_DOMAIN',   // ← replace
  projectId: 'YOUR_PROJECT_ID',     // ← replace
  storageBucket: 'YOUR_STORAGE_BUCKET', // ← replace
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID', // ← replace
  appId: 'YOUR_APP_ID',             // ← replace
};
```

---

## Step 5 — Enable Authentication

1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** tab → **Email/Password** → Enable → Save

---

## Step 6 — Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Select **Start in production mode** → choose your region (e.g. `asia-south1`)
3. Copy and paste the contents of `firestore.rules` into the **Rules** tab

---

## Step 7 — Enable Firebase Storage

1. Firebase Console → **Storage** → **Get started**
2. Select your region → **Done**
3. Copy and paste the contents of `storage.rules` into the **Rules** tab

---

## Step 8 — Run the App

```bash
npx expo start
```

- Press **a** to open on Android emulator / device
- Press **i** to open on iOS simulator (macOS only)
- Scan the QR code with Expo Go on your phone

---

## Firestore Data Schema

```
/spots/{spotId}
  id: string
  title: string
  description: string
  category: string
  photos: string[]           ← Firebase Storage URLs
  coverImage: string         ← First photo URL
  bestTime: string
  location: { lat: number, lng: number, address?: string }
  ownerId: string
  ownerUsername: string
  ownerAvatar: string | null
  favoritesCount: number
  views: number
  isPublic: boolean
  createdAt: Timestamp
  updatedAt: Timestamp

/users/{uid}
  uid: string
  username: string
  email: string
  profilePicture: string | null
  spotsCount: number
  createdAt: Timestamp

/favorites/{uid}/spots/{spotId}
  spotId: string
  spotTitle: string
  spotCoverImage: string
  spotCategory: string
  addedAt: Timestamp
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `auth/invalid-api-key` | Check your `apiKey` in `firebase/config.ts` |
| `FirebaseError: Missing or insufficient permissions` | Ensure Firestore/Storage rules are deployed |
| Metro bundler crashes | Run `npx expo start --clear` |
| Biometric not showing | Only appears after first successful login on a device with biometrics enrolled |
