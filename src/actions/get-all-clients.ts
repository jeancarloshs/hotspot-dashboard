"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllClients() {
  const response = await apiRequest({ path: "/clients", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
