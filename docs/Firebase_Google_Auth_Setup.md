# Firebase + Google Auth Environment Setup (Routezy)

This guide shows how to get all required environment variables for:

- Mobile (`Expo` app)
- Backend (`Node/Express` server)

It covers these variables:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON` (backend)

---

## 1) Create or open your Firebase project

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or open an existing project).
3. Complete project creation steps.

---

## 2) Enable Google sign-in in Firebase Auth

1. In Firebase Console, open your project.
2. Go to **Authentication** -> **Sign-in method**.
3. Enable **Google** provider.
4. Add a support email if prompted.
5. Save.

Without this step, Google sign-in requests will fail even if client IDs are correct.

---

## 3) Get `EXPO_PUBLIC_FIREBASE_*` values from Firebase app config

You need Firebase web app config values for the Expo Firebase SDK setup.

1. In Firebase Console, click the **gear icon** -> **Project settings**.
2. In **Your apps**, click **Add app** and choose **Web** (`</>` icon).
3. Register the app (nickname can be anything, e.g. `Routezy Web Config`).
4. After registration, Firebase displays `firebaseConfig`.

It looks like:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Map values:

- `EXPO_PUBLIC_FIREBASE_API_KEY` = `apiKey`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` = `authDomain`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID` = `projectId`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` = `storageBucket`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `messagingSenderId`
- `EXPO_PUBLIC_FIREBASE_APP_ID` = `appId`

---

## 4) Configure OAuth consent screen in Google Cloud

Google client IDs are created in Google Cloud (same project as Firebase).

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Ensure top project matches your Firebase project.
3. Go to **APIs & Services** -> **OAuth consent screen**.
4. Choose **External** (or Internal if your org requires it).
5. Fill app name, support email, developer contact email.
6. Add scopes (basic profile/email is enough for Google sign-in).
7. Add test users if app is in testing mode.
8. Save and continue.

You only need to set this once before creating OAuth client IDs.

---

## 5) Create `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`

1. In Google Cloud Console, go to **APIs & Services** -> **Credentials**.
2. Click **Create Credentials** -> **OAuth client ID**.
3. Choose **Web application**.
4. Give it a name, e.g. `Routezy Web`.
5. (Optional) Add authorized redirect URIs if needed by your flow.
6. Click **Create**.
7. Copy the generated **Client ID**.

Set:

- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<that client id>`

---

## 6) Create `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID` (Expo Go / development flow)

Use another OAuth client ID for Expo auth-session usage.

Recommended approach:

1. Create another **OAuth client ID** of type **Web application**.
2. Name it `Routezy Expo`.
3. Copy client ID.

Set:

- `EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=<that client id>`

Note: In many setups this may match web client ID, but keeping separate IDs is cleaner.

---

## 7) Create `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

1. In **Credentials**, click **Create Credentials** -> **OAuth client ID**.
2. Choose **Android**.
3. Enter:
   - **Package name**: your Android application ID (`android.package` in Expo config/app.json).
   - **SHA-1 certificate fingerprint**: from debug or release keystore.
4. Click **Create**.
5. Copy client ID.

Set:

- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=<that client id>`

### Getting SHA-1 on Windows (debug keystore)

Run in PowerShell:

```powershell
keytool -list -v -alias androiddebugkey -keystore "$env:USERPROFILE\.android\debug.keystore" -storepass android -keypass android
```

Use the printed `SHA1:` value.

For production builds, use your release keystore SHA-1 instead.

---

## 8) Create `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

1. In **Credentials**, click **Create Credentials** -> **OAuth client ID**.
2. Choose **iOS**.
3. Enter **Bundle ID** (`ios.bundleIdentifier` in Expo config/app.json).
4. Click **Create**.
5. Copy client ID.

Set:

- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<that client id>`

---

## 9) Get `FIREBASE_SERVICE_ACCOUNT_JSON` for backend

Your backend uses Firebase Admin SDK and needs a service account key.

1. In Firebase Console, open **Project settings**.
2. Go to **Service accounts** tab.
3. Click **Generate new private key**.
4. Download the JSON file (example: `serviceAccountKey.json`).

The file contains fields like:

- `type`
- `project_id`
- `private_key_id`
- `private_key`
- `client_email`
- etc.

You must place the full JSON in one env var:

- `FIREBASE_SERVICE_ACCOUNT_JSON`

### Convert JSON file to one-line string (PowerShell)

```powershell
Get-Content .\serviceAccountKey.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
```

Copy output and set:

```env
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"...","universe_domain":"googleapis.com"}
```

Important:

- Keep quotes valid JSON.
- Keep `\n` in `private_key` as escaped newlines.
- Do not commit this secret to git.

---

## 10) Where to store env variables in Routezy

### Mobile

Create/update:

- `mobile/.env`

Example:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_API_BASE_URL=
```

### Backend

Create/update:

- `server/.env`

Example:

```env
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=30d
FIREBASE_SERVICE_ACCOUNT_JSON=
```

---

## 11) Restart apps after env changes

After editing env values:

1. Stop Expo dev server and backend server.
2. Restart backend.
3. Restart Expo (`npm start` / `expo start`).

Environment values are read on process start, so restart is required.

---

## 12) Quick verification checklist

- Firebase Auth Google provider is enabled.
- All `EXPO_PUBLIC_FIREBASE_*` values come from Firebase web app config.
- Android/iOS OAuth client IDs match your exact package/bundle IDs.
- Android SHA-1 is correct for the keystore used.
- Backend has valid `FIREBASE_SERVICE_ACCOUNT_JSON`.
- No secrets are committed to git.


