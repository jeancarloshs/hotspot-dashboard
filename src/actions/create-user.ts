"use server";

import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";
import { cookies } from "next/headers";

export type UserInput = {
  name: string;
  email: string;
  password: string;
  status?: string;
  permission: string;
  ispID: number;
};

export async function createUser(formData: UserInput) {
  const _environment = new ProdConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { status: 401, data: { message: "Sessão expirada." } };

  try {
    const response = await axios.request({
      url: `${_environment.API_URL}/user/create`,
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        status: formData.status || null,
        permission: formData.permission,
        ispID: formData.ispID,
      },
    });
    return { response: response.data, status: response.status };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: "Erro ao salvar usuário" },
      };
    }
    return { status: 500, data: { message: "Erro ao salvar usuário" } };
  }
}
