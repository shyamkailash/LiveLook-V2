import { createContext } from "react";
import type { SignupResult, AuthUser } from "@/lib/firebase";
import type { LoginCredentials, SignupCredentials } from "@/types/auth";

export interface AuthContextValue {
  authenticated: boolean;
  initialized: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<SignupResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
