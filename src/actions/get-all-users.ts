"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllUsers() {
  const response = await apiRequest({ path: "/users", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
