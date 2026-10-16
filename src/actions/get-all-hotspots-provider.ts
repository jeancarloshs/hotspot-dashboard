"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllHotspotsProvider(id: string) {
  const response = await apiRequest({ path: `/hotspots/provider/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
