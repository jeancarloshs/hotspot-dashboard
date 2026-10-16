"use server";

import { apiRequest } from "@/actions/api-request";

export async function deleteClient(id: string) {
  return apiRequest({
    path: `/client/delete/${id}`,
    method: "DELETE",
  });
}
