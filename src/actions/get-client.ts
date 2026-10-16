"use server";

import { apiRequest } from "@/actions/api-request";

export async function getClient(id: string) {
  return apiRequest({
    path: `/client/${id}`,
    method: "GET",
  });
}
