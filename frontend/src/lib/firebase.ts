import { initializeApp, type FirebaseApp, type FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
  type User,
} from "firebase/auth";
import type { LoginCredentials, SignupCredentials } from "@/types/auth";

export type AuthUser = User;

export interface SignupResult {
  user: AuthUser;
}

export class AuthFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthFlowError";
  }
}

function cleanEnv(value: string | undefined) {
  return value?.trim().replace(/^["']|["']$/g, "") || undefined;
}

function cleanAuthDomain(value: string | undefined) {
  const cleaned = cleanEnv(value);
  if (!cleaned) return undefined;

  try {
    return new URL(cleaned).hostname;
  } catch {
    return cleaned.replace(/\/+$/, "");
  }
}

const firebaseConfig = {
  apiKey: cleanEnv(import.meta.env.VITE_FIREBASE_API_KEY as string | undefined),
  appId: cleanEnv(import.meta.env.VITE_FIREBASE_APP_ID as string | undefined),
  authDomain: cleanAuthDomain(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined),
  messagingSenderId: cleanEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined),
  projectId: cleanEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined),
  storageBucket: cleanEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined),
};

function getConfigError() {
  const missingKeys = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missingKeys.length) {
    return "Firebase environment variables are missing.";
  }

  if (!firebaseConfig.authDomain?.includes(".")) {
    return "Firebase auth domain is invalid.";
  }

  return null;
}

const configError = getConfigError();

export const app: FirebaseApp | null = configError ? null : initializeApp(firebaseConfig);
export const auth: Auth | null = app ? getAuth(app) : null;

function getFirebaseAuth() {
  if (!auth || configError) {
    throw new AuthFlowError(configError ?? "Firebase is not configured.");
  }

  return auth;
}

function debugAuth(label: string, payload?: unknown) {
  if (import.meta.env.DEV) {
    console.debug(`[auth] ${label}`, payload ?? "");
  }
}

function debugAuthError(label: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(`[auth] ${label}`, error);
  }
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void) {
  if (!auth) return () => undefined;

  return onAuthStateChanged(
    auth,
    (user) => {
      debugAuth("state changed", user);
      callback(user);
    },
    (error) => {
      debugAuthError("state change failed", error);
      callback(null);
    },
  );
}

export async function signInTeacher(credentials: LoginCredentials) {
  const firebaseAuth = getFirebaseAuth();

  try {
    await setPersistence(
      firebaseAuth,
      credentials.remember ? browserLocalPersistence : browserSessionPersistence,
    );
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      credentials.email.trim(),
      credentials.password,
    );
    debugAuth("sign in success", credential.user);
    return credential.user;
  } catch (error) {
    debugAuthError("sign in failed", error);
    throw error;
  }
}

export async function signUpTeacher(credentials: SignupCredentials): Promise<SignupResult> {
  const firebaseAuth = getFirebaseAuth();

  try {
    const credential = await createUserWithEmailAndPassword(
      firebaseAuth,
      credentials.email.trim(),
      credentials.password,
    );
    await updateProfile(credential.user, { displayName: credentials.fullName.trim() });
    debugAuth("sign up success", credential.user);
    return { user: credential.user };
  } catch (error) {
    debugAuthError("sign up failed", error);
    throw error;
  }
}

export async function signOutTeacher() {
  try {
    await signOut(getFirebaseAuth());
    debugAuth("sign out success");
  } catch (error) {
    debugAuthError("sign out failed", error);
    throw error;
  }
}

export async function sendTeacherPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    debugAuth("password reset sent");
  } catch (error) {
    debugAuthError("password reset failed", error);
    throw error;
  }
}

function getFirebaseCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as FirebaseError).code)
    : "";
}

export function getReadableAuthError(error: unknown) {
  const code = getFirebaseCode(error);

  if (error instanceof AuthFlowError) return error.message;

  switch (code) {
    case "auth/user-not-found":
      return "User not found";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect password or invalid email";
    case "auth/email-already-in-use":
      return "Email already exists";
    case "auth/invalid-email":
      return "Invalid email";
    case "auth/weak-password":
      return "Password too weak";
    case "auth/network-request-failed":
      return "Network connection failed";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/operation-not-allowed":
      return "Email/password authentication is not enabled.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    default:
      return "Authentication failed. Please try again.";
  }
}
