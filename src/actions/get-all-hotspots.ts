"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllHotspots() {
  const response = await apiRequest({ path: "/hotspots", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
