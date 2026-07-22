import {
  signInTeacher,
  signOutTeacher,
  signUpTeacher,
} from "@/lib/firebase";
import type { LoginCredentials, SignupCredentials } from "@/types/auth";

export async function login(credentials: LoginCredentials) {
  return signInTeacher(credentials);
}

export async function signup(credentials: SignupCredentials) {
  return signUpTeacher(credentials);
}

export async function logout() {
  await signOutTeacher();
  return true;
}
