"use server";

import { apiRequest } from "@/actions/api-request";

export async function getHotspot(id: string): Promise<any> {
  const response = await apiRequest({ path: `/hotspot/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
