"use server";

import ProdConfig from "@/app/api/config/prod_config";
import { clearAuthSession } from "@/actions/session";
import axios from "axios";
import { cookies } from "next/headers";

export async function userLogout() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const environment = new ProdConfig();

  if (token) {
    try {
      await axios.request({
        url: `${environment.API_URL}/logout`,
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: refreshToken ? { refreshToken } : {},
        timeout: 8000,
      });
    } catch {
      // Limpa cookies locais mesmo se a API falhar.
    }
  }

  cookieStore.delete("token");
  cookieStore.delete("refreshToken");
  await clearAuthSession();
}
