"use server";

import { AuthSession, EMPTY_SESSION } from "@/app/lib/session-types";
import { cookies } from "next/headers";

export type { AuthSession };

const PROFILE_OPTS = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_DEBUG === "production",
  maxAge: 24 * 60 * 60,
  sameSite: "strict" as const,
  path: "/",
};

export async function setAuthSession(input: {
  permission?: string | null;
  name?: string | null;
  email?: string | null;
  ispID?: number | null;
  userID?: number | null;
}) {
  const cookieStore = await cookies();
  if (input.permission) {
    cookieStore.set("permission", input.permission, PROFILE_OPTS);
  } else {
    cookieStore.delete("permission");
  }
  if (input.name) {
    cookieStore.set("userName", input.name, PROFILE_OPTS);
  } else {
    cookieStore.delete("userName");
  }
  if (input.email) {
    cookieStore.set("userEmail", input.email, PROFILE_OPTS);
  } else {
    cookieStore.delete("userEmail");
  }
  if (input.ispID != null && Number.isFinite(input.ispID)) {
    cookieStore.set("ispID", String(input.ispID), PROFILE_OPTS);
  } else {
    cookieStore.delete("ispID");
  }
  if (input.userID != null && Number.isFinite(input.userID)) {
    cookieStore.set("userID", String(input.userID), PROFILE_OPTS);
  } else {
    cookieStore.delete("userID");
  }
}

export async function clearAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete("permission");
  cookieStore.delete("userName");
  cookieStore.delete("userEmail");
  cookieStore.delete("ispID");
  cookieStore.delete("userID");
}

export async function getAuthSession(): Promise<AuthSession> {
  const cookieStore = await cookies();
  const ispRaw = cookieStore.get("ispID")?.value;
  const userRaw = cookieStore.get("userID")?.value;
  const ispID = ispRaw != null && ispRaw !== "" ? Number(ispRaw) : null;
  const userID = userRaw != null && userRaw !== "" ? Number(userRaw) : null;

  const session: AuthSession = {
    permission: cookieStore.get("permission")?.value ?? null,
    name: cookieStore.get("userName")?.value ?? null,
    email: cookieStore.get("userEmail")?.value ?? null,
    ispID: ispID != null && Number.isFinite(ispID) ? ispID : null,
    userID: userID != null && Number.isFinite(userID) ? userID : null,
  };

  if (!session.permission && !session.name && !session.email) {
    return EMPTY_SESSION;
  }
  return session;
}
