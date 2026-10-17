"use server";

import ProdConfig from "@/app/api/config/prod_config";
import axios from "axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type UserCommand = {
  action: "user";
  ip: string;
  name: string;
  password: string;
  email?: string;
  comment?: string;
  server?: string;
  profile?: string;
};

type ProfileCommand = {
  action: "profile";
  ip: string;
  name: string;
  rateLimit: string;
  sessionTimeout: string;
  idleTimeout: string;
};

type DefaultCommand = {
  action: "default";
  ip: string;
  profileName: string;
  hotspotName: string;
};

type LoginCommand = {
  action: "login";
  ip: string;
  name: string;
  password: string;
  userIp: string;
  hsID: number;
};

export type MikrotikWrite = UserCommand | ProfileCommand | DefaultCommand | LoginCommand;

const CONFIG_RESOURCES = new Set([
  "{ip}/vlans",
  "{ip}/interfaces",
  "{ip}/interfaces/ethernet",
  "{ip}/interfaces/bridge",
  "{ip}/interfaces/bridge/port",
  "{ip}/files",
  "{ip}/backup",
  "{ip}/backup/restore",
  "{ip}/export",
  "{ip}/routes",
  "{ip}/dhcp/leases",
  "{ip}/dhcp/networks",
  "{ip}/dhcp/servers",
  "{ip}/ip/address",
  "{ip}/ip/pool",
  "{ip}/queues/simple",
  "hotspot/{ip}/users",
  "hotspot/{ip}/users/active",
  "{ip}/hotspot/profiles",
  "{ip}/hotspot",
  "{ip}/hotspot/walled-garden",
  "{ip}/firewall/filter",
  "{ip}/firewall/nat",
  "{ip}/firewall/mangle",
  "{ip}/firewall/raw",
  "{ip}/l2tp-server",
  "{ip}/ipsec/peers",
  "{ip}/ipsec/policies",
]);

const BOOLEAN_KEYS = new Set(["compact", "hideSensitive", "verbose"]);

export type MikrotikConfig = {
  ip: string;
  method: "POST" | "PUT" | "DELETE";
  resource: string;
  body: Record<string, string>;
  required: string[];
};

function dottedIp(address: string) {
  const host = address.trim().split("/")[0].replace(/-/g, ".");
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  if (host.split(".").some((part) => Number(part) > 255)) return null;
  return host;
}

function text(value: string | undefined) {
  return value?.trim() || "";
}

function payloadFor(command: MikrotikWrite, ip: string) {
  if (command.action === "user") {
    if (!text(command.name) || !command.password) {
      return { error: "Nome e senha são obrigatórios." };
    }
    return {
      path: "/mikrotik/hotspot/user",
      body: {
        ipHotspot: ip,
        name: text(command.name),
        password: command.password,
        email: text(command.email),
        comment: text(command.comment),
        server: text(command.server),
        profile: text(command.profile),
      },
    };
  }

  if (command.action === "profile") {
    if (!text(command.name) || !text(command.rateLimit) || !text(command.sessionTimeout) || !text(command.idleTimeout)) {
      return { error: "Preencha nome, limite, sessão e ociosidade." };
    }
    return {
      path: "/mikrotik/hotspot/profile",
      body: {
        ip,
        name: text(command.name),
        rateLimit: text(command.rateLimit),
        sessionTimeout: text(command.sessionTimeout),
        idleTimeout: text(command.idleTimeout),
      },
    };
  }

  if (command.action === "default") {
    if (!text(command.profileName) || !text(command.hotspotName)) {
      return { error: "Informe o perfil e o identificador do servidor hotspot." };
    }
    return {
      path: "/mikrotik/hotspot/profile/default",
      body: {
        ip,
        profileName: text(command.profileName),
        hotspotName: text(command.hotspotName),
      },
    };
  }

  if (!text(command.name) || !command.password || !dottedIp(command.userIp)) {
    return { error: "Informe usuário, senha e o IP do dispositivo." };
  }
  if (!Number.isInteger(command.hsID) || command.hsID <= 0) {
    return { error: "Hotspot inválido para autenticação." };
  }
  return {
    path: "/mikrotik/hotspot/user/login",
    body: {
      ipHotspot: ip,
      name: text(command.name),
      password: command.password,
      userIp: dottedIp(command.userIp),
      hsID: command.hsID,
    },
  };
}

function failure(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return { error: "A alteração excedeu o tempo. O MikroTik pode estar inacessível." };
    }
    const payload = error.response?.data;
    const message = typeof payload === "string"
      ? payload
      : payload?.message || "Não foi possível alterar o MikroTik.";
    return { error: message };
  }
  return { error: "Não foi possível alterar o MikroTik." };
}

async function send(method: "POST" | "PUT" | "DELETE", path: string, body: unknown): Promise<{ message?: string; error?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) {
    cookieStore.delete("token");
    redirect("/");
  }

  const _environment = new ProdConfig();

  try {
    const response = await axios.request({
      url: `${_environment.API_URL}${path}`,
      method,
      timeout: 20000,
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: body,
    });
    const message = typeof response.data?.message === "string"
      ? response.data.message
      : "Alteração enviada ao MikroTik.";
    return { message };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      cookieStore.delete("token");
      redirect("/");
    }
    return failure(error);
  }
}

export async function writeMikrotik(command: MikrotikWrite): Promise<{ message?: string; error?: string }> {
  const ip = dottedIp(command.ip);
  if (!ip) return { error: "IP do MikroTik inválido." };

  const prepared = payloadFor(command, ip);
  if ("error" in prepared) return prepared;
  return send("POST", prepared.path, prepared.body);
}

export async function configureMikrotik(input: MikrotikConfig): Promise<{ message?: string; error?: string }> {
  const ip = dottedIp(input.ip);
  if (!ip) return { error: "IP do MikroTik inválido." };
  if (
    (input.method !== "POST" && input.method !== "PUT" && input.method !== "DELETE")
    || !CONFIG_RESOURCES.has(input.resource)
  ) {
    return { error: "Esta alteração não está disponível." };
  }

  const body: Record<string, string | boolean> = {};
  for (const [key, value] of Object.entries(input.body || {})) {
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(key)) continue;
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (!trimmed) continue;
    if (BOOLEAN_KEYS.has(key)) {
      if (trimmed === "true" || trimmed === "yes") body[key] = true;
      else if (trimmed === "false" || trimmed === "no") body[key] = false;
      continue;
    }
    body[key] = trimmed;
  }

  for (const key of input.required) {
    if (body[key] == null || body[key] === "") return { error: "Preencha os campos obrigatórios." };
  }
  const allowEmpty = input.method === "POST" && input.resource === "{ip}/export";
  if (!allowEmpty && Object.keys(body).length === 0) {
    return { error: "Informe ao menos um campo para alterar." };
  }
  if (input.method !== "DELETE" && body.id && Object.keys(body).length === 1) {
    return { error: "Informe ao menos um campo para alterar." };
  }

  const slug = ip.replaceAll(".", "-");
  return send(input.method, `/mikrotik/${input.resource.replace("{ip}", slug)}`, body);
}
