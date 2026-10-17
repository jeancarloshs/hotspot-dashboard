"use server";

import { apiRequest } from "@/actions/api-request";

export async function getAllDevices(limit = 100) {
  const response = await apiRequest({
    path: `/devices?limit=${limit}`,
    method: "GET",
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getDevice(id: string | number) {
  const response = await apiRequest({
    path: `/device/${id}`,
    method: "GET",
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getConnectionLogs(filters?: { hsID?: number; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.hsID != null) params.set("hsID", String(filters.hsID));
  if (filters?.limit != null) params.set("limit", String(filters.limit));
  const search = params.toString();
  const response = await apiRequest({
    path: `/connection-logs${search ? `?${search}` : ""}`,
    method: "GET",
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getConnectionLog(id: string | number) {
  const response = await apiRequest({
    path: `/connection-log/${id}`,
    method: "GET",
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}
