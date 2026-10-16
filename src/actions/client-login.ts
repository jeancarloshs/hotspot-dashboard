"use server";

import { apiRequest } from "@/actions/api-request";

export async function clientLogin(body: { email: string; password: string; hsID: number }) {
  return apiRequest({
    path: "/client/login",
    method: "POST",
    data: body,
    auth: false,
  });
}
