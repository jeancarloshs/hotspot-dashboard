"use server";

import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";
import { cookies } from "next/headers";

export type HotspotInput = {
  nome?: string;
  endereco?: string;
  numero?: string;
  cidade?: string;
  bairro?: string;
  estado?: string;
  cep?: string;
  complemento?: string;
  ip?: string;
  status?: string;
  ispID?: number | null;
};

export async function createHotspot(formData: HotspotInput) {
  const _environment = new ProdConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { status: 401, data: { message: "Sessão expirada." } };

  try {
    const response = await axios.request({
      url: `${_environment.API_URL}/hotspot/create`,
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        nome: formData.nome || null,
        endereco: formData.endereco || null,
        numero: formData.numero || null,
        cidade: formData.cidade || null,
        bairro: formData.bairro || null,
        estado: formData.estado || null,
        cep: formData.cep || null,
        complemento: formData.complemento || null,
        ip: formData.ip || null,
        status: formData.status || null,
        ispID: formData.ispID || null,
      },
    });
    return { response: response.data, status: response.status };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: "Erro ao salvar hotspot" },
      };
    }
    return { status: 500, data: { message: "Erro ao salvar hotspot" } };
  }
}
