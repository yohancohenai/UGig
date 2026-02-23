import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: 'ugig_onboarding_complete',
  AUTH_SESSION: 'ugig_auth_session',
  COLLEGE_ID: 'ugig_college_id',
} as const;

// --- Onboarding ---

export async function getOnboardingComplete(): Promise<boolean> {
  const val = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return val === 'true';
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, String(done));
}

// --- Auth Session ---

export interface StoredSession {
  userId: string;
  email: string;
  name: string;
}

export async function getAuthSession(): Promise<StoredSession | null> {
  const raw = await AsyncStorage.getItem(KEYS.AUTH_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setAuthSession(session: StoredSession | null): Promise<void> {
  if (session) {
    await AsyncStorage.setItem(KEYS.AUTH_SESSION, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(KEYS.AUTH_SESSION);
  }
}

// --- College ---

export async function getStoredCollegeId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.COLLEGE_ID);
}

export async function setStoredCollegeId(id: string | null): Promise<void> {
  if (id) {
    await AsyncStorage.setItem(KEYS.COLLEGE_ID, id);
  } else {
    await AsyncStorage.removeItem(KEYS.COLLEGE_ID);
  }
}

// --- Full Reset (for testing) ---

export async function resetAllStorage(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.ONBOARDING_COMPLETE,
    KEYS.AUTH_SESSION,
    KEYS.COLLEGE_ID,
  ]);
}
