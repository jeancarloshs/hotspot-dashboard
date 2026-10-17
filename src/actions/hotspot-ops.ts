"use server";

import { apiRequest } from "@/actions/api-request";

export type BootstrapHotspotInput = {
  interface?: string;
  serverName?: string;
  addressPool?: string;
  createServer?: boolean;
  walledGardenHosts?: string[];
  planIDs?: number[];
};

export async function checkHotspotHealth(id: string | number) {
  return apiRequest({
    path: `/hotspot/${id}/health`,
    method: "POST",
  });
}

export async function bootstrapHotspot(id: string | number, data: BootstrapHotspotInput) {
  return apiRequest({
    path: `/hotspot/${id}/bootstrap`,
    method: "POST",
    data,
  });
}
