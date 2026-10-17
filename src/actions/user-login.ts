"use server";

import axios from "axios";
import ProdConfig from "@/app/api/config/prod_config";
import { setAuthSession, clearAuthSession } from "@/actions/session";
import { canAccessPanel } from "@/app/lib/acl";
import { cookies } from "next/headers";

export async function loginUser(data: FormData | null): Promise<{
  data?: unknown;
  status: number;
  error?: string;
}> {
  const _environment = new ProdConfig();
  const cookieStore = await cookies();

  if (!data) {
    return { status: 400, error: "Os dados enviados são inválidos." };
  }

  const email = data.get("username");
  const password = data.get("password");

  if (!email || !password) {
    return { status: 400, error: "Email ou senha não foram fornecidos." };
  }

  try {
    const response = await axios.request({
      url: `${_environment.API_URL}/login`,
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
      data: {
        email,
        password,
      },
    });

    if (response.status !== 200) {
      return {
        data: response.data,
        status: response.status,
        error: "Não foi possível entrar.",
      };
    }

    const auth = response.data?.objAuth ?? {};
    const permission = typeof auth.permission === "string" ? auth.permission : null;

    if (!canAccessPanel(permission)) {
      await clearAuthSession();
      cookieStore.delete("token");
      cookieStore.delete("refreshToken");
      return {
        status: 403,
        error: "Esta conta não tem nível de acesso para o painel. É necessário suporte ou superior.",
        data: response.data,
      };
    }

    cookieStore.set("token", auth.token, {
      httpOnly: true,
      secure: process.env.NEXT_PUBLIC_DEBUG === "production",
      maxAge: 24 * 60 * 60,
      sameSite: "strict",
      path: "/",
    });
    if (typeof auth.refreshToken === "string" && auth.refreshToken) {
      cookieStore.set("refreshToken", auth.refreshToken, {
        httpOnly: true,
        secure: process.env.NEXT_PUBLIC_DEBUG === "production",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "strict",
        path: "/",
      });
    }

    await setAuthSession({
      permission,
      name: typeof auth.name === "string" ? auth.name : null,
      email: typeof auth.email === "string" ? auth.email : null,
      ispID: typeof auth.ispID === "number" ? auth.ispID : null,
      userID: typeof auth.userID === "number" ? auth.userID : null,
    });

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data;
      const message = typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "Não foi possível entrar.";
      return {
        status: error.response?.status || 500,
        error: message,
      };
    }
    return { status: 500, error: "Não foi possível entrar." };
  }
}
