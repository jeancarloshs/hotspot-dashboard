import type { MikrotikTool } from "@/actions/query-mikrotik";

export type FieldKind = "text" | "password" | "yesno" | "email";

export type FieldSpec = {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  kind: FieldKind;
};

type FieldMeta = {
  label: string;
  placeholder?: string;
  kind?: FieldKind;
};

const FIELD_META: Record<string, FieldMeta> = {
  id: { label: "Identificador", placeholder: "*1" },
  name: { label: "Nome" },
  password: { label: "Senha", kind: "password" },
  email: { label: "E-mail", kind: "email" },
  comment: { label: "Comentário" },
  server: { label: "Servidor", placeholder: "hotspot1" },
  profile: { label: "Perfil", placeholder: "default" },
  rateLimit: { label: "Limite", placeholder: "2M/2M" },
  sessionTimeout: { label: "Sessão", placeholder: "1h" },
  idleTimeout: { label: "Ociosidade", placeholder: "5m" },
  profileName: { label: "Perfil" },
  hotspotName: { label: "Servidor hotspot", placeholder: "*1" },
  userIp: { label: "IP do dispositivo", placeholder: "192.168.88.50" },
  vlanId: { label: "VLAN ID", placeholder: "10" },
  interface: { label: "Interface", placeholder: "ether2" },
  disabled: { label: "Desativado", kind: "yesno" },
  mtu: { label: "MTU" },
  arp: { label: "ARP" },
  useServiceTag: { label: "Service tag", kind: "yesno" },
  speed: { label: "Velocidade", placeholder: "1Gbps" },
  autoNegotiation: { label: "Autonegociação", kind: "yesno" },
  poeOut: { label: "PoE" },
  protocolMode: { label: "Protocolo", placeholder: "rstp" },
  dstAddress: { label: "Destino", placeholder: "10.0.0.0/24" },
  gateway: { label: "Gateway", placeholder: "192.168.88.1" },
  distance: { label: "Distância", placeholder: "1" },
  routingMark: { label: "Routing mark" },
  scope: { label: "Scope" },
  targetScope: { label: "Target scope" },
  address: { label: "Endereço", placeholder: "192.168.88.50" },
  macAddress: { label: "MAC", placeholder: "AA:BB:CC:DD:EE:FF" },
  hostName: { label: "Hostname" },
  limitUptime: { label: "Limite de tempo", placeholder: "1h" },
  limitBytesTotal: { label: "Limite de bytes" },
  sharedUsers: { label: "Usuários compartilhados", placeholder: "1" },
  addressPool: { label: "Pool", placeholder: "dhcp-hotspot" },
  addressesPerMac: { label: "Endereços por MAC" },
  keepaliveTimeout: { label: "Keepalive" },
  chain: { label: "Chain", placeholder: "forward" },
  action: { label: "Ação", placeholder: "accept" },
  srcAddress: { label: "Origem" },
  protocol: { label: "Protocolo", placeholder: "tcp" },
  srcPort: { label: "Porta de origem" },
  dstPort: { label: "Porta de destino" },
  inInterface: { label: "Interface de entrada" },
  outInterface: { label: "Interface de saída" },
  connectionState: { label: "Estado da conexão" },
  toAddresses: { label: "Traduzir para" },
  toPorts: { label: "Portas traduzidas" },
  newRoutingMark: { label: "Nova routing mark" },
  newConnectionMark: { label: "Nova connection mark" },
  newPacketMark: { label: "Nova packet mark" },
  passthrough: { label: "Passthrough", kind: "yesno" },
  enabled: { label: "Habilitado", kind: "yesno" },
  maxMtu: { label: "MTU máximo" },
  maxMru: { label: "MRU máximo" },
  authentication: { label: "Autenticação" },
  maxSessions: { label: "Sessões máximas" },
  defaultProfile: { label: "Perfil padrão" },
  useIpsec: { label: "Usar IPsec", kind: "yesno" },
  ipsecSecret: { label: "Segredo IPsec", kind: "password" },
  oneSessionPerHost: { label: "Uma sessão por host", kind: "yesno" },
  exchangeMode: { label: "Modo de troca" },
  localAddress: { label: "Endereço local" },
  peer: { label: "Peer" },
  tunnel: { label: "Túnel", kind: "yesno" },
  level: { label: "Nível" },
};

export type EditorSpec = {
  id: string;
  group: "Hotspot" | "Rede" | "Firewall" | "VPN";
  label: string;
  hint: string;
  fields: FieldSpec[];
  list?: MikrotikTool;
  listKey?: string;
} & (
  | { mode: "legacy"; action: "user" | "profile" | "default" | "login" }
  | { mode: "config"; method: "POST" | "PUT"; resource: string }
);

export const EDITOR_GROUPS = ["Hotspot", "Rede", "Firewall", "VPN"] as const;

const PROFILE_FIELDS = new Set(["profile", "profileName", "defaultProfile"]);

export function usesProfileList(name: string) {
  return PROFILE_FIELDS.has(name);
}

function fields(
  names: string[],
  required: string[] = [],
  placeholders: Record<string, string> = {}
): FieldSpec[] {
  return names.map((name) => {
    const meta = FIELD_META[name];
    return {
      name,
      label: meta.label,
      placeholder: placeholders[name] ?? meta.placeholder,
      kind: meta.kind ?? "text",
      required: required.includes(name),
    };
  });
}

const FILTER_FIELDS = [
  "chain",
  "action",
  "srcAddress",
  "dstAddress",
  "protocol",
  "srcPort",
  "dstPort",
  "inInterface",
  "outInterface",
  "connectionState",
  "comment",
  "disabled",
];

const NAT_FIELDS = [...FILTER_FIELDS.slice(0, -2), "toAddresses", "toPorts", "comment", "disabled"];

const MANGLE_FIELDS = [
  ...FILTER_FIELDS.slice(0, -2),
  "newRoutingMark",
  "newConnectionMark",
  "newPacketMark",
  "passthrough",
  "comment",
  "disabled",
];

export const EDITORS: EditorSpec[] = [
  {
    id: "user",
    group: "Hotspot",
    label: "Usuário",
    hint: "Cria um usuário no hotspot deste MikroTik.",
    mode: "legacy",
    action: "user",
    fields: fields(["name", "password", "email", "server", "profile", "comment"], ["name", "password"]),
  },
  {
    id: "user-edit",
    group: "Hotspot",
    label: "Editar usuário",
    hint: "Altera o usuário indicado pelo identificador. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "hotspot/{ip}/users",
    list: "users",
    fields: fields(["id", "name", "password", "profile", "server", "email", "comment", "disabled", "limitUptime", "limitBytesTotal"], ["id"]),
  },
  {
    id: "profile",
    group: "Hotspot",
    label: "Perfil",
    hint: "Cria um perfil com limite de banda e tempos de sessão.",
    mode: "legacy",
    action: "profile",
    fields: fields(["name", "rateLimit", "sessionTimeout", "idleTimeout"], ["name", "rateLimit", "sessionTimeout", "idleTimeout"]),
  },
  {
    id: "profile-edit",
    group: "Hotspot",
    label: "Editar perfil",
    hint: "Altera o perfil indicado pelo identificador. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/hotspot/profiles",
    list: "profiles",
    fields: fields(["id", "name", "rateLimit", "sessionTimeout", "idleTimeout", "sharedUsers", "addressPool", "comment"], ["id"]),
  },
  {
    id: "default",
    group: "Hotspot",
    label: "Perfil padrão",
    hint: "Troca o perfil padrão do servidor hotspot. O identificador é o .id do servidor, não o nome do perfil.",
    mode: "legacy",
    action: "default",
    fields: fields(["profileName", "hotspotName"], ["profileName", "hotspotName"]),
  },
  {
    id: "login",
    group: "Hotspot",
    label: "Autenticar",
    hint: "Entra com um usuário já cadastrado a partir do IP do dispositivo.",
    mode: "legacy",
    action: "login",
    fields: fields(["name", "password", "userIp"], ["name", "password", "userIp"]),
  },
  {
    id: "server",
    group: "Hotspot",
    label: "Servidor",
    hint: "Cria um servidor hotspot na interface informada.",
    mode: "config",
    method: "POST",
    resource: "{ip}/hotspot",
    fields: fields(
      ["name", "interface", "addressPool", "profile", "addressesPerMac", "idleTimeout", "keepaliveTimeout", "disabled"],
      ["name", "interface"],
      { name: "hotspot1", interface: "bridge-hotspot" }
    ),
  },
  {
    id: "server-edit",
    group: "Hotspot",
    label: "Editar servidor",
    hint: "Altera o servidor hotspot indicado pelo identificador. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/hotspot",
    list: "servers",
    fields: fields(["id", "name", "interface", "addressPool", "profile", "addressesPerMac", "idleTimeout", "keepaliveTimeout", "disabled"], ["id"]),
  },
  {
    id: "vlan",
    group: "Rede",
    label: "VLAN",
    hint: "Cria uma interface VLAN com nome, ID e interface pai.",
    mode: "config",
    method: "POST",
    resource: "{ip}/vlans",
    fields: fields(["name", "vlanId", "interface", "comment", "mtu", "arp", "useServiceTag", "disabled"], ["name", "vlanId", "interface"], { name: "vlan10" }),
  },
  {
    id: "vlan-edit",
    group: "Rede",
    label: "Editar VLAN",
    hint: "Altera a VLAN indicada pelo identificador. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/vlans",
    list: "vlans",
    fields: fields(["id", "name", "vlanId", "interface", "comment", "mtu", "arp", "useServiceTag", "disabled"], ["id"]),
  },
  {
    id: "interface-edit",
    group: "Rede",
    label: "Interface",
    hint: "Altera nome, comentário, MTU ou o estado da interface.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/interfaces",
    list: "interfaces",
    fields: fields(["id", "name", "comment", "mtu", "disabled"], ["id"]),
  },
  {
    id: "ethernet-edit",
    group: "Rede",
    label: "Ethernet",
    hint: "Altera velocidade, autonegociação, PoE e o estado da porta ethernet.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/interfaces/ethernet",
    list: "ethernet",
    fields: fields(["id", "name", "comment", "mtu", "speed", "autoNegotiation", "poeOut", "disabled"], ["id"]),
  },
  {
    id: "bridge",
    group: "Rede",
    label: "Bridge",
    hint: "Cria uma bridge neste MikroTik.",
    mode: "config",
    method: "POST",
    resource: "{ip}/interfaces/bridge",
    fields: fields(["name", "comment", "mtu", "protocolMode", "disabled"], ["name"], { name: "bridge-hotspot" }),
  },
  {
    id: "route-edit",
    group: "Rede",
    label: "Rota",
    hint: "Altera destino, gateway e distância da rota indicada.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/routes",
    list: "routes",
    fields: fields(["id", "dstAddress", "gateway", "distance", "routingMark", "scope", "targetScope", "comment", "disabled"], ["id"]),
  },
  {
    id: "lease-edit",
    group: "Rede",
    label: "DHCP",
    hint: "Altera o lease DHCP indicado pelo identificador.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/dhcp/leases",
    list: "leases",
    fields: fields(["id", "address", "macAddress", "server", "hostName", "comment", "disabled"], ["id"]),
  },
  {
    id: "filter",
    group: "Firewall",
    label: "Filter",
    hint: "Cria uma regra de filter. Chain e ação são obrigatórios.",
    mode: "config",
    method: "POST",
    resource: "{ip}/firewall/filter",
    fields: fields(FILTER_FIELDS, ["chain", "action"]),
  },
  {
    id: "filter-edit",
    group: "Firewall",
    label: "Editar filter",
    hint: "Altera a regra de filter indicada. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/firewall/filter",
    list: "filter",
    fields: fields(["id", ...FILTER_FIELDS], ["id"]),
  },
  {
    id: "nat",
    group: "Firewall",
    label: "NAT",
    hint: "Cria uma regra de NAT. Chain e ação são obrigatórios.",
    mode: "config",
    method: "POST",
    resource: "{ip}/firewall/nat",
    fields: fields(NAT_FIELDS, ["chain", "action"], { chain: "srcnat", action: "masquerade" }),
  },
  {
    id: "nat-edit",
    group: "Firewall",
    label: "Editar NAT",
    hint: "Altera a regra de NAT indicada. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/firewall/nat",
    list: "nat",
    fields: fields(["id", ...NAT_FIELDS], ["id"], { chain: "srcnat", action: "masquerade" }),
  },
  {
    id: "mangle",
    group: "Firewall",
    label: "Mangle",
    hint: "Cria uma regra de mangle. Chain e ação são obrigatórios.",
    mode: "config",
    method: "POST",
    resource: "{ip}/firewall/mangle",
    fields: fields(MANGLE_FIELDS, ["chain", "action"], { chain: "prerouting", action: "mark-routing" }),
  },
  {
    id: "mangle-edit",
    group: "Firewall",
    label: "Editar mangle",
    hint: "Altera a regra de mangle indicada. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/firewall/mangle",
    list: "mangle",
    fields: fields(["id", ...MANGLE_FIELDS], ["id"], { chain: "prerouting", action: "mark-routing" }),
  },
  {
    id: "raw",
    group: "Firewall",
    label: "Raw",
    hint: "Cria uma regra de raw. Chain e ação são obrigatórios.",
    mode: "config",
    method: "POST",
    resource: "{ip}/firewall/raw",
    fields: fields(FILTER_FIELDS, ["chain", "action"]),
  },
  {
    id: "raw-edit",
    group: "Firewall",
    label: "Editar raw",
    hint: "Altera a regra de raw indicada. Campos em branco permanecem como estão.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/firewall/raw",
    list: "raw",
    fields: fields(["id", ...FILTER_FIELDS], ["id"]),
  },
  {
    id: "l2tp",
    group: "VPN",
    label: "L2TP",
    hint: "Altera o servidor L2TP. Envie apenas os campos que devem mudar.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/l2tp-server",
    fields: fields(["enabled", "maxMtu", "maxMru", "authentication", "keepaliveTimeout", "maxSessions", "defaultProfile", "useIpsec", "ipsecSecret", "oneSessionPerHost"]),
  },
  {
    id: "ipsec-peer",
    group: "VPN",
    label: "Peer IPsec",
    hint: "Altera o peer IPsec indicado pelo identificador.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/ipsec/peers",
    list: "vpn",
    listKey: "peers",
    fields: fields(["id", "name", "address", "profile", "exchangeMode", "localAddress", "comment", "disabled"], ["id"]),
  },
  {
    id: "ipsec-policy",
    group: "VPN",
    label: "Policy IPsec",
    hint: "Altera a policy IPsec indicada pelo identificador.",
    mode: "config",
    method: "PUT",
    resource: "{ip}/ipsec/policies",
    list: "vpn",
    listKey: "policies",
    fields: fields(["id", "peer", "tunnel", "srcAddress", "dstAddress", "protocol", "action", "level", "comment", "disabled"], ["id"]),
  },
];

export function rowsFrom(value: unknown, listKey?: string): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object" && !Array.isArray(item)) as Record<string, unknown>[];
  }
  if (!value || typeof value !== "object") return [];
  const record = value as Record<string, unknown>;
  const keys = listKey ? [listKey, "data", "result"] : ["data", "result", "rows"];
  for (const key of keys) {
    if (Array.isArray(record[key])) return rowsFrom(record[key]);
  }
  if (listKey && record[listKey] && typeof record[listKey] === "object") {
    return rowsFrom(record[listKey]);
  }
  if (listKey) return [];
  return [record];
}

export function readRow(row: Record<string, unknown>, name: string) {
  const kebab = name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const keys = name === "id" ? [".id", "id"] : [name, kebab];
  for (const key of keys) {
    const value = row[key];
    if (value == null || value === "" || typeof value === "object") continue;
    return String(value);
  }
  return "";
}

export function yesNoValue(value: string) {
  if (value === "true" || value === "yes") return "yes";
  if (value === "false" || value === "no") return "no";
  return "";
}

export function rowId(row: Record<string, unknown>) {
  return readRow(row, "id");
}

export function rowLabel(row: Record<string, unknown>, index: number) {
  const id = rowId(row);
  const titleKeys = ["name", "comment", "address", "dst-address", "dstAddress", "mac-address", "macAddress", "chain", "peer", "gateway"];
  let title = "";
  for (const key of titleKeys) {
    const value = row[key];
    if (typeof value === "string" && value) {
      title = value;
      break;
    }
  }
  return [id || `item ${index + 1}`, title].filter(Boolean).join(" · ");
}
