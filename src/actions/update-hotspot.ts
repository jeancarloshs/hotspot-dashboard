"use server";

import { apiRequest } from "@/actions/api-request";
import type { HotspotInput } from "@/actions/create-hotspot";

export async function updateHotspot(id: string, formData: HotspotInput) {
  const data: Record<string, unknown> = {
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
  };

  if (formData.mk_user?.trim()) data.mk_user = formData.mk_user.trim();
  if (formData.mk_password) data.mk_password = formData.mk_password;
  if (formData.mk_api_port != null && !Number.isNaN(formData.mk_api_port)) {
    data.mk_api_port = formData.mk_api_port;
  }

  return apiRequest({
    path: `/hotspot/update/${id}`,
    method: "PUT",
    data,
  });
}
