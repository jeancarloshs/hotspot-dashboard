"use server";

import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";
import { cookies } from "next/headers";

export type ApiResult = {
  status: number;
  data: unknown;
};

export async function apiRequest(options: {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  auth?: boolean;
}): Promise<ApiResult> {
  const environment = new ProdConfig();
  const headers: Record<string, string> = {
    Accept: "*/*",
    "Content-Type": "application/json",
  };

  if (options.auth !== false) {
    const token = (await cookies()).get("token")?.value;
    if (!token) return { status: 401, data: { message: "Sessão expirada." } };
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
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: "Não foi possível concluir a operação." },
      };
    }
    return { status: 500, data: { message: "Não foi possível concluir a operação." } };
  }
}
