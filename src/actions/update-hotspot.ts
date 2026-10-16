"use server";

import { apiRequest } from "@/actions/api-request";
import type { HotspotInput } from "@/actions/create-hotspot";

export async function updateHotspot(id: string, formData: HotspotInput) {
  return apiRequest({
    path: `/hotspot/update/${id}`,
    method: "PUT",
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
}
