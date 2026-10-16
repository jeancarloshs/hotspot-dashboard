"use server";

import { apiRequest } from "@/actions/api-request";

export async function getProvider(id: string): Promise<any> {
  const response = await apiRequest({ path: `/provider/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
