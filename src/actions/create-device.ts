"use server";

import { apiRequest } from "@/actions/api-request";

export type DeviceInput = {
  cpf: string;
  user_agent?: string;
  device_type?: string;
  os?: string;
  os_version?: string;
  browser?: string;
  browser_version?: string;
  screen_width?: number;
  screen_height?: number;
};

export async function createDevice(body: DeviceInput) {
  return apiRequest({
    path: "/device/create",
    method: "POST",
    data: body,
    auth: false,
  });
}
