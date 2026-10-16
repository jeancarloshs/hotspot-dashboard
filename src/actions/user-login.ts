"use server";

import axios from "axios";
import ProdConfig from "@/app/api/config/prod_config";
import { cookies } from 'next/headers';

export async function loginUser(data: FormData | null): Promise<any> {
  const _environment = new ProdConfig();
  const cookieStore = await cookies();
  // console.log(data)

  if (!data) {
    throw new Error("Os dados enviados são inválidos.");
  }

  const email = data.get("username");
  const password = data.get("password");

  if (!email || !password) {
    throw new Error("Email ou senha não foram fornecidos.");
  }

  const bodyContent = JSON.stringify({
    email: email,
    password: password,
  });

  const headersList = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  const reqOptions = {
    url: `${_environment.API_URL}/login`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };


  try {
    const response = await axios.request(reqOptions);

    if (response.status === 200) {
      const auth = response.data?.objAuth ?? {};
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
    }

    return {
      data: response.data,
      status: response.status
    }
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
