import admin from 'firebase-admin';

let firebaseApp;

function parseServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_JSON in environment variables.');
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch (_error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON.');
  }
}

export function getFirebaseAdminAuth() {
  if (!firebaseApp) {
    const serviceAccount = parseServiceAccount();
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  return admin.auth(firebaseApp);
}

