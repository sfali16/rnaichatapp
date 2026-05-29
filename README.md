# RN AI Chat App

A React Native chat interface built with Expo. The app is a foundation for an AI-powered chat client — it includes multi-session support, a resizable header, a rich input bar with an attachment menu, and proper keyboard handling on both web and Android.

## Features

- **Chat bubbles** — sent messages on the right (blue), received on the left (grey); text is selectable for copy
- **Multi-session** — create new chat sessions and switch between them via a dropdown; each session keeps its own history
- **Resizable header** — Small / Medium / Large padding presets
- **Input bar** — 3-line multiline input, Enter to send, Shift+Enter for a new line, `+` attachment menu, Send button
- **Android notch support** — header respects the status bar and camera cutout
- **Runs on** — web browser, Android emulator, and physical Android device via Expo Go

---

## Prerequisites (Windows)

Install the following before anything else.

### 1. Node.js
Download and install the **LTS** release from https://nodejs.org.
After installing, verify in Git Bash:
```bash
node --version   # e.g. v20.x.x
npm --version    # e.g. 10.x.x
```

### 2. Git + Git Bash
Download from https://git-scm.com/download/win. Git Bash is the terminal used in all commands below.

### 3. Java Development Kit (JDK) — Android only
Required to build and run the Android emulator. Install **JDK 17** (LTS):
https://adoptium.net/temurin/releases/?version=17

---

## Getting Started

### Clone and install

```bash
git clone https://github.com/sfali16/RNAIChatApp.git
cd RNAIChatApp
npm install
```

---

## Run on Web

The fastest way to get started — no phone or emulator needed.

```bash
npm run web
```

The app opens automatically at **http://localhost:8081** in your browser.

---

## Run on Android Emulator

### Step 1 — Install Android Studio

Download from https://developer.android.com/studio and run the installer. When asked, keep the default components checked (Android SDK, Android Virtual Device).

### Step 2 — Install the Android SDK

1. Open Android Studio
2. Go to **More Actions → SDK Manager** (or **Settings → Languages & Frameworks → Android SDK**)
3. Note the **Android SDK Location** shown at the top (e.g. `C:\Users\YourName\AppData\Local\Android\Sdk`)
4. Under the **SDK Platforms** tab — check **Android 14 (API 34)**
5. Under the **SDK Tools** tab — check:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator
6. Click **Apply** and wait for the download to finish

### Step 3 — Enable Windows Virtualization

The emulator requires hardware virtualisation. Open **Run** (`Windows + R`), type `optionalfeatures`, and enable:
- **Virtual Machine Platform**
- **Windows Hypervisor Platform**

Restart your PC after enabling these.

### Step 4 — Create a Virtual Device

1. In Android Studio go to **More Actions → Virtual Device Manager**
2. Click **+** → select **Pixel 8** → Next
3. Download the **API 34** system image if prompted → Next → Finish
4. Press the ▶️ button to start the emulator and wait for it to fully boot

### Step 5 — Run the app

Open Git Bash, set your paths, and launch:

```bash
export PATH="/c/dev/nodejs:$PATH"
export ANDROID_HOME="/c/Users/YourName/AppData/Local/Android/Sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"

cd /c/path/to/RNAIChatApp
npm run android
```

> Replace `YourName` with your Windows username and adjust the Node path if Node is installed elsewhere.

Expo will build and install the app on the running emulator automatically.

---

## Run on a Physical Android Device via Expo Go

No emulator or build tools needed — just your phone and a WiFi connection.

### Step 1 — Install Expo Go

Install **Expo Go** from the Google Play Store on your Android phone.

### Step 2 — Start the dev server

```bash
export PATH="/c/dev/nodejs:$PATH"
cd /c/path/to/RNAIChatApp
npx expo start
```

A QR code appears in the terminal.

### Step 3 — Connect your phone

Open the **Camera app** on your phone and point it at the QR code. Tap the notification that appears to open the app in Expo Go.

> **Important:** your phone and PC must be on the **same WiFi network**. If the QR code doesn't connect, press **`a`** in the terminal to switch to tunnel mode, which works across different networks.

---

---

## E2E Tests (Playwright — Web)

The test suite uses [Playwright](https://playwright.dev) and runs against the web version of the app.

### Step 1 — Install Playwright and its browsers

```bash
npx playwright install --with-deps chromium
```

This downloads Chromium and any system dependencies it needs. Only needs to be run once.

### Step 2 — Start the web server

Open a terminal and start the app:

```bash
export PATH="/c/dev/nodejs:$PATH"
npm run web
```

Leave this running and open a second terminal for the next step.

### Step 3 — Run the tests

```bash
export PATH="/c/dev/nodejs:$PATH"
npm run test:e2e
```

Chromium will open and you will see the tests execute in the browser. Results are printed in the terminal when done. Screenshots and video are saved to `test-results/` for any failing test.

### Visual UI mode

For a more interactive experience — step through each test action with a timeline, screenshots, and DOM snapshots:

```bash
npm run test:e2e:ui
```

### What is tested

| Suite | Covers |
|---|---|
| `e2e/chat.spec.js` | Sending messages via button and Enter key, Shift+Enter newline, input cleared after send, bubble count |
| `e2e/sessions.spec.js` | Create sessions, switch between them, history preserved, dropdown list, active checkmark, backdrop dismiss |
| `e2e/header.spec.js` | S/M/L header height changes, active button highlight |

---

## Project Structure

```
RNAIChatApp/
├── App.js              # Entire app — components, state, styles
├── app.json            # Expo configuration (name, icons, splash)
├── package.json        # Dependencies and npm scripts
├── playwright.config.js # Playwright configuration
├── e2e/                # Playwright test suites
│   ├── chat.spec.js
│   ├── sessions.spec.js
│   └── header.spec.js
└── assets/             # App icons and splash screen images
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run web` | Run in the browser at localhost:8081 |
| `npm run android` | Build and launch on a connected emulator or device |
| `npx expo start` | Start the dev server and show QR code for Expo Go |
| `npm run test:e2e` | Run Playwright tests against the web app |
| `npm run test:e2e:ui` | Open the Playwright visual test runner |
