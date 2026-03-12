import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'tripzo.session.v1';
const ONBOARDING_KEY = 'tripzo.onboarding.done.v1';

export async function saveSession(session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function readSession() {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function markOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}

export async function isOnboardingDone() {
  const value = await AsyncStorage.getItem(ONBOARDING_KEY);
  return value === 'true';
}

