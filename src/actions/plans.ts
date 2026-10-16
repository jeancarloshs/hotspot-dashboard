"use server";

import { apiRequest } from "@/actions/api-request";

export type PlanInput = {
  name: string;
  description?: string;
  price?: number | null;
  rate_limit?: string;
  session_timeout?: string;
  idle_timeout?: string;
  shared_users?: string;
  validity_hours?: number | null;
  ispID?: number | null;
  hsID?: number | null;
  mk_profile?: string;
  sync_mikrotik?: boolean;
  status?: string;
};

export async function getAllPlans() {
  const response = await apiRequest({ path: "/plans", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getPlan(id: string) {
  const response = await apiRequest({ path: `/plan/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function createPlan(data: PlanInput) {
  return apiRequest({ path: "/plan/create", method: "POST", data });
}

export async function updatePlan(id: string, data: PlanInput) {
  return apiRequest({ path: `/plan/update/${id}`, method: "PUT", data });
}

export async function deletePlan(id: string) {
  return apiRequest({ path: `/plan/delete/${id}`, method: "DELETE" });
}
