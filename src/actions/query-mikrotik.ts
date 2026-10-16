"use server";

import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";
import { cookies } from "next/headers";

const TOOLS = {
  resource: (ip: string) => `${ip}/resource`,
  health: (ip: string) => `${ip}/health`,
  logs: (ip: string) => `${ip}/logs`,
  users: (ip: string) => `hotspot/${ip}/users`,
  active: (ip: string) => `hotspot/${ip}/users/active`,
  profiles: (ip: string) => `${ip}/hotspot/profiles`,
  servers: (ip: string) => `${ip}/hotspot`,
  interfaces: (ip: string) => `${ip}/interfaces`,
  ethernet: (ip: string) => `${ip}/interfaces/ethernet`,
  vlans: (ip: string) => `${ip}/vlans`,
  routes: (ip: string) => `${ip}/routes`,
  leases: (ip: string) => `${ip}/dhcp/leases`,
  filter: (ip: string) => `${ip}/firewall/filter`,
  nat: (ip: string) => `${ip}/firewall/nat`,
  mangle: (ip: string) => `${ip}/firewall/mangle`,
  raw: (ip: string) => `${ip}/firewall/raw`,
  vpn: (ip: string) => `${ip}/pptp-server`,
  ping: (ip: string) => `${ip}/ping`,
  tracert: (ip: string) => `${ip}/tracert`,
  reboot: (ip: string) => `${ip}/reboot`,
} as const;

export type MikrotikTool = keyof typeof TOOLS;

function routerSlug(address: string) {
  const host = address.trim().split("/")[0].replace(/-/g, ".");
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  const parts = host.split(".").map((part) => Number(part));
  if (parts.some((part) => part > 255)) return null;
  return host.replaceAll(".", "-");
}

function destinationAddress(value: string) {
  const target = value.trim();
  if (!/^[a-zA-Z0-9.-]{1,253}$/.test(target)) return null;
  return target;
}

export async function queryMikrotik(
  tool: MikrotikTool,
  address: string,
  query?: { ip?: string; count?: number }
) {
  const slug = routerSlug(address);
  const buildPath = TOOLS[tool];
  if (!slug || !buildPath) {
    return { error: "IP do MikroTik inválido." };
  }

  const _environment = new ProdConfig();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return { error: "Sessão expirada." };

  const params = new URLSearchParams();
  if (tool === "ping" || tool === "tracert") {
    const target = destinationAddress(query?.ip || "");
    if (!target) return { error: "Informe um destino válido." };
    params.set("ip", target);
  }
  if (tool === "ping") {
    const count = Number(query?.count ?? 5);
    params.set("count", String(Number.isFinite(count) ? Math.min(Math.max(count, 1), 20) : 5));
  }

  const search = params.toString();
  const url = `${_environment.API_URL}/mikrotik/${buildPath(slug)}${search ? `?${search}` : ""}`;

  try {
    const response = await axios.request({
      url,
      method: "GET",
      timeout: tool === "ping" || tool === "tracert" ? 45000 : 20000,
      headers: {
        Accept: "*/*",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    const equipmentSilent = data == null
      || data === ""
      || (Array.isArray(data) && data.length === 0 && (tool === "resource" || tool === "health"));
    if (equipmentSilent) {
      return { error: "O MikroTik não respondeu. Verifique se o IP está acessível." };
    }
    return { data };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
        return { error: "A consulta excedeu o tempo. O MikroTik pode estar inacessível." };
      }
      const payload = error.response?.data;
      const message = typeof payload === "string"
        ? payload
        : payload?.message || "Não foi possível consultar o MikroTik.";
      return { error: message };
    }
    return { error: "Não foi possível consultar o MikroTik." };
  }
}
