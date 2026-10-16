"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllClientsConnected() {
  const response = await apiRequest({ path: "/all_clients/connected", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
