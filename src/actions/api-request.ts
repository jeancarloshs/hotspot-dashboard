"use server";

import ProdConfig from "@/app/api/config/prod_config";
import { refreshAccessToken } from "@/actions/refresh-token";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type ApiResult = {
  status: number;
  data: unknown;
};

async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("refreshToken");
}

export async function apiRequest(options: {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  auth?: boolean;
  _retried?: boolean;
}): Promise<ApiResult> {
  const environment = new ProdConfig();
  const headers: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  if (options.auth !== false) {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      await clearSession();
      redirect("/");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.request({
      url: `${environment.API_URL}${options.path}`,
      method: options.method,
      headers,
      data: options.data,
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 && options.auth !== false && !options._retried) {
        const refreshed = await refreshAccessToken();
        if (refreshed.ok) {
          return apiRequest({ ...options, _retried: true });
        }
        await clearSession();
        redirect("/");
      }
      if (error.response?.status === 401 && options.auth !== false) {
        await clearSession();
        redirect("/");
      }
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: "Não foi possível concluir a operação." },
      };
    }
    return { status: 500, data: { message: "Não foi possível concluir a operação." } };
  }
}
