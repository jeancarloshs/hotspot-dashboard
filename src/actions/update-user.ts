"use server";

import { apiRequest } from "@/actions/api-request";

export type UserUpdateInput = {
  name: string;
  email: string;
  password?: string;
  status?: string;
  permission: string;
  ispID: number;
};

export async function updateUser(id: string, formData: UserUpdateInput) {
  const data: Record<string, string | number> = {
    name: formData.name,
    email: formData.email,
    permission: formData.permission,
    ispID: formData.ispID,
  };
  if (formData.status) data.status = formData.status;
  if (formData.password) data.password = formData.password;

  return apiRequest({
    path: `/user/update/${id}`,
    method: "PUT",
    data,
  });
}
