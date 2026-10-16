"use server";

import { apiRequest } from "@/actions/api-request";

export async function updateClient(id: string, body: Record<string, string | number>) {
  return apiRequest({
    path: `/client/update/${id}`,
    method: "PUT",
    data: body,
  });
}
