import { useEffect, useMemo, useState } from "react";
import {
  sendTeacherPasswordReset,
  signInTeacher,
  signOutTeacher,
  signUpTeacher,
  subscribeToAuthChanges,
  type AuthUser,
} from "@/lib/firebase";
import { AuthContext } from "@/contexts/auth-context";
import type { LoginCredentials, SignupCredentials } from "@/types/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
  }, []);

  async function login(credentials: LoginCredentials) {
    setLoading(true);
    try {
      await signInTeacher(credentials);
    } finally {
      setLoading(false);
    }
  }

  async function signup(credentials: SignupCredentials) {
    setLoading(true);
    try {
      return await signUpTeacher(credentials);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    try {
      await signOutTeacher();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(email: string) {
    setLoading(true);
    try {
      await sendTeacherPasswordReset(email);
    } finally {
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      authenticated: Boolean(user),
      initialized,
      isAuthenticated: Boolean(user),
      loading,
      login,
      logout,
      resetPassword,
      signup,
      user,
    }),
    [initialized, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
