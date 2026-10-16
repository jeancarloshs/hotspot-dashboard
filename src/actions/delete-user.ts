"use server";

import { apiRequest } from "@/actions/api-request";

export async function deleteUser(userID: string) {
  return apiRequest({
    path: `/user/delete/${userID}`,
    method: "DELETE",
  });
}
