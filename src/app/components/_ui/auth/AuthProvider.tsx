"use client";

import { AuthSession, EMPTY_SESSION } from "@/app/lib/session-types";
import { createContext, useContext, useMemo } from "react";

const AuthContext = createContext<AuthSession>(EMPTY_SESSION);

export function AuthProvider({
  session,
  children,
}: {
  session: AuthSession;
  children: React.ReactNode;
}) {
  const value = useMemo(() => session ?? EMPTY_SESSION, [session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession(): AuthSession {
  return useContext(AuthContext);
}
