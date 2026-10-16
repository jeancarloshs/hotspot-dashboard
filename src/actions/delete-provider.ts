"use server";

import { apiRequest } from "@/actions/api-request";

export async function deleteProvider(id: string) {
  return apiRequest({
    path: `/provider/delete/${id}`,
    method: "DELETE",
  });
}
