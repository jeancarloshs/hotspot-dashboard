"use server";

import { apiRequest } from "@/actions/api-request";

export async function createClient(body: Record<string, string | number>) {
  return apiRequest({
    path: "/client/create",
    method: "POST",
    data: body,
    auth: false,
  });
}
