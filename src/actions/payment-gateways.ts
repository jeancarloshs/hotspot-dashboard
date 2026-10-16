"use server";

import { apiRequest } from "@/actions/api-request";

export type PaymentGatewayInput = {
  name: string;
  provider: string;
  ispID?: number | null;
  hsID?: number | null;
  public_key?: string;
  access_token?: string;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
  webhook_path?: string;
  sandbox?: boolean;
  status?: string;
  extra?: Record<string, unknown> | null;
};

export async function getAllPaymentGateways() {
  const response = await apiRequest({ path: "/payment-gateways", method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getPaymentGateway(id: string) {
  const response = await apiRequest({ path: `/payment-gateway/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function createPaymentGateway(data: PaymentGatewayInput) {
  return apiRequest({ path: "/payment-gateway/create", method: "POST", data });
}

export async function updatePaymentGateway(id: string, data: PaymentGatewayInput) {
  return apiRequest({ path: `/payment-gateway/update/${id}`, method: "PUT", data });
}

export async function deletePaymentGateway(id: string) {
  return apiRequest({ path: `/payment-gateway/delete/${id}`, method: "DELETE" });
}
