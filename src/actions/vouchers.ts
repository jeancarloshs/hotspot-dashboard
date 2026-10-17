"use server";

import { apiRequest } from "@/actions/api-request";

export type VoucherFilters = {
  hsID?: number;
  planID?: number;
  status?: string;
};

export type VoucherGenerateInput = {
  planID: number;
  quantity: number;
  hsID?: number | null;
  prefix?: string;
  expires_at?: string;
  samePasswordAsCode?: boolean;
};

export type VoucherRedeemInput = {
  code: string;
  hsID: number;
  password?: string;
};

export async function getAllVouchers(filters: VoucherFilters = {}) {
  const params = new URLSearchParams();
  if (filters.hsID) params.set("hsID", String(filters.hsID));
  if (filters.planID) params.set("planID", String(filters.planID));
  if (filters.status) params.set("status", filters.status);
  const search = params.toString();
  const response = await apiRequest({
    path: `/vouchers${search ? `?${search}` : ""}`,
    method: "GET",
  });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function getVoucher(id: string) {
  const response = await apiRequest({ path: `/voucher/${id}`, method: "GET" });
  return response.status >= 200 && response.status < 300 ? response.data : null;
}

export async function generateVouchers(data: VoucherGenerateInput) {
  return apiRequest({ path: "/vouchers/generate", method: "POST", data });
}

export async function deleteVoucher(id: string) {
  return apiRequest({ path: `/voucher/delete/${id}`, method: "DELETE" });
}

export async function redeemVoucher(data: VoucherRedeemInput) {
  return apiRequest({
    path: "/voucher/redeem",
    method: "POST",
    data,
    auth: false,
  });
}

export type VoucherBatchExport = {
  batch: string;
  quantity: number;
  filename: string;
  csv: string;
};

export async function exportVoucherBatch(batch: string) {
  const encoded = encodeURIComponent(batch.trim());
  return apiRequest({
    path: `/vouchers/batch/${encoded}/export?format=json`,
    method: "GET",
  });
}
