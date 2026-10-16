"use server";

import { apiRequest } from "@/actions/api-request";

export async function deleteHotspot(id: string) {
  return apiRequest({
    path: `/hotspot/delete/${id}`,
    method: "DELETE",
  });
}
