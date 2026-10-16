"use server";

import { apiRequest } from "@/actions/api-request";
import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";

export type CheckoutInput = {
  planID: number;
  gatewayID: number;
  hsID?: number | null;
  userID?: number | null;
  payment_method?: string;
  metadata?: Record<string, unknown>;
};

export type WebhookInput = {
  order_number?: string;
  status?: string;
  external_id?: string;
  event_type?: string;
};

export async function getAllOrders(filters?: { hsID?: number; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.hsID != null) params.set("hsID", String(filters.hsID));
  if (filters?.status) params.set("status", filters.status);
  const search = params.toString();
  const response = await apiRequest({
    path: `/orders${search ? `?${search}` : ""}`,
    method: "GET",
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getOrder(id: string) {
  const response = await apiRequest({ path: `/order/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getPublicPaymentGateways(hsID?: number) {
  const search = hsID != null ? `?hsID=${hsID}` : "";
  const response = await apiRequest({
    path: `/payment-gateways/public${search}`,
    method: "GET",
    auth: false,
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function checkoutPayment(data: CheckoutInput) {
  return apiRequest({
    path: "/payments/checkout",
    method: "POST",
    data,
    auth: false,
  });
}

export async function getPaymentOrderByNumber(orderNumber: string) {
  const response = await apiRequest({
    path: `/payments/order/${encodeURIComponent(orderNumber)}`,
    method: "GET",
    auth: false,
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function simulatePayment(orderNumber: string) {
  return apiRequest({
    path: `/payments/simulate/${encodeURIComponent(orderNumber)}`,
    method: "POST",
  });
}

export async function postPaymentWebhook(
  provider: string,
  data: WebhookInput,
  webhookSecret?: string
) {
  if (!webhookSecret) {
    return apiRequest({
      path: `/payments/webhook/${encodeURIComponent(provider)}`,
      method: "POST",
      data,
      auth: false,
    });
  }

  const environment = new ProdConfig();
  try {
    const response = await axios.request({
      url: `${environment.API_URL}/payments/webhook/${encodeURIComponent(provider)}`,
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        "x-webhook-secret": webhookSecret,
      },
      data,
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        status: error.response?.status || 500,
        data: error.response?.data || { message: "Não foi possível enviar o webhook." },
      };
    }
    return { status: 500, data: { message: "Não foi possível enviar o webhook." } };
  }
}
