<div align="center">

# 📸 FrameFinder

**Discover. Capture. Share.**

A React Native app for photographers to discover, save, and share the best photography spots — built with Expo, Firebase, and a fully custom dark-mode design system.

</div>

---

## About

FrameFinder is a community-driven photography spot finder. Users browse and upload locations worth photographing — waterfalls, city skylines, sunrise points, hidden street corners — complete with the best time to shoot, exact coordinates, and real photos from people who've been there. Every spot can be saved to favorites, and any spot can be turned into a shareable, branded story card in a couple of taps.

The app is built entirely with React Native's core `StyleSheet` API — no Tailwind, no NativeWind — with a hand-tuned design system (warm cream and golden-hour orange on near-black surfaces) meant to evoke film photography rather than a generic app template.

---

## ✨ Features

**Discover**
- Browse a live feed of photography spots with category filtering (Beach, Mountain, Waterfall, Forest, Wildlife, Architecture, Street, City, Sunrise, Sunset, and more)
- Instant local search across spot name, category, description, and owner — no extra network requests as you type

**Spot Details**
- Full spot profile: photo gallery, description, best time to shoot, GPS coordinates, and the contributor who added it
- Save any spot to your favorites with a single tap

**Add & Manage**
- Upload 1–3 photos per spot, tag a category, and attach your current GPS location in a few steps
- Edit or delete spots you've added

**Share**
- Generate a branded, Instagram-Story-ready share card for any spot (captured on-device with `react-native-view-shot`)
- Share natively, save straight to your gallery, or export the original full-quality photo

**Account**
- Email/password authentication via Firebase Auth
- Optional biometric login (Face ID / Fingerprint) after your first sign-in
- Personal profile with your uploaded spots and stats

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo (Managed Workflow) |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| Media Storage | Firebase Storage |
| Styling | React Native `StyleSheet` (no CSS frameworks) |
| Image Handling | `expo-image`, `expo-image-manipulator`, `expo-image-picker` |
| Location | `expo-location` |
| Share Cards | `react-native-view-shot`, `expo-sharing`, `expo-media-library` |
| Biometrics | `expo-local-authentication`, `expo-secure-store` |
| Animation | `react-native-reanimated` |

---

## 📱 App Structure

FrameFinder has 5 primary tabs — **Discover**, **Search**, **Add**, **Saved**, and **Profile** — plus a dedicated spot detail stack for viewing, editing, and sharing individual spots.

```
framefinder/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/              # Login & register
│   ├── (tabs)/               # Bottom tab screens
│   └── spot/                 # Spot detail, edit, and related routes
├── components/              # Reusable UI components
├── constants/                # Design tokens — colors, typography, spacing, categories
├── context/                  # App-wide state (auth, spots, favorites)
├── firebase/                 # Auth, Firestore, and Storage service layers
├── hooks/                    # Custom hooks (auth, biometrics, share cards)
├── styles/                   # Shared global StyleSheet objects
├── types/                    # Shared TypeScript interfaces
└── assets/images/            # App icons and splash assets
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo` — no global install required)
- The [Expo Go](https://expo.dev/go) app, or an Android/iOS emulator
- A Firebase project (see below)

### Installation

```bash
git clone https://github.com/sandula-sanchana/framefinder.git
cd framefinder
npm install
```

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. **Authentication** → Sign-in method → enable **Email/Password**
3. **Firestore Database** → create in your preferred region, then apply the rules in [`firestore.rules`](./firestore.rules)
4. **Storage** → enable, then apply the rules in [`storage.rules`](./storage.rules)
5. Project Settings → add a **Web app** → copy the config object into `firebase/config.ts`

Full step-by-step instructions are in [`SETUP.md`](./SETUP.md).

### Run the App

```bash
npx expo start
```

Scan the QR code with Expo Go, or press `a` / `i` to launch an Android/iOS emulator.

---

## 🎨 Design System

FrameFinder uses a single source of truth for its visuals under `constants/`:

- **`Colors.ts`** — near-black backgrounds, warm cream (`#E8D5B7`) as the primary brand tone, golden-hour orange (`#FF6B35`) as the action accent
- **`Typography.ts`** — a consistent type scale from `xs` (11px) to `display` (36px)
- **`Spacing.ts`** — an 8-point-based spacing and radius scale

Every screen is built with `StyleSheet.create()` against these tokens — there's no ad-hoc styling anywhere in the codebase.

---

## 🗺 Firestore Data Model

```
/spots/{spotId}        → title, category, photos, location, owner, favoritesCount, ...
/users/{uid}            → username, email, profilePicture, spotsCount
/favorites/{uid}/spots/{spotId}
```

---

## 📄 License

This project is currently unlicensed / private coursework. Add a license here if you plan to open it up.

---

<div align="center">

Built by [Sandula Sanchana](https://github.com/sandula-sanchana)

</div>
