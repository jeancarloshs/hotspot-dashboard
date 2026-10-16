"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllProviders() {
  const response = await apiRequest({ path: "/providers", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
