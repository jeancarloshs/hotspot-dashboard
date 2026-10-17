"use server";

import { apiRequest } from "@/actions/api-request";

export async function checkHotspotHealth(id: string | number) {
  return apiRequest({
    path: `/hotspot/${id}/health`,
    method: "POST",
  });
}
