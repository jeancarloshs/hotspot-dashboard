"use server";

import ProdConfig from "@/app/api/config/prod_config";
import { clearAuthSession, setAuthSession } from "@/actions/session";
import { decodeJwtPayload } from "@/app/lib/jwt-payload";
import axios from "axios";
import { cookies } from "next/headers";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NEXT_PUBLIC_DEBUG === "production",
  maxAge: 24 * 60 * 60,
  sameSite: "strict" as const,
  path: "/",
};

export async function refreshAccessToken(): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return { ok: false, error: "Refresh token ausente." };
  }

  const environment = new ProdConfig();
  try {
    const response = await axios.request({
      url: `${environment.API_URL}/refresh`,
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      data: { refreshToken },
    });

    const token = response.data?.token;
    if (!token) {
      return { ok: false, error: "Resposta de refresh inválida." };
    }

    cookieStore.set("token", token, COOKIE_OPTS);
    if (typeof response.data?.refreshToken === "string" && response.data.refreshToken) {
      cookieStore.set("refreshToken", response.data.refreshToken, {
        ...COOKIE_OPTS,
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    const payload = decodeJwtPayload(token);
    if (payload) {
      await setAuthSession({
        permission: typeof payload.permission === "string" ? payload.permission : null,
        name: typeof payload.name === "string" ? payload.name : null,
        email: typeof payload.email === "string" ? payload.email : null,
        ispID: typeof payload.ispID === "number" ? payload.ispID : null,
        userID: typeof payload.userID === "number" ? payload.userID : null,
      });
    }

    return { ok: true };
  } catch (error) {
    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    await clearAuthSession();
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data;
      const message = typeof payload === "string"
        ? payload
        : payload?.message || "Não foi possível renovar a sessão.";
      return { ok: false, error: message };
    }
    return { ok: false, error: "Não foi possível renovar a sessão." };
  }
}
