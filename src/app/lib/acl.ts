/**
 * Espelha a ACL do painel em api-hotspot (`src/middleware/acl.ts`).
 * Hierarquia: visitante < usuario_regular < usuario_premium < suporte
 * < moderador < gerente < administrador < super_admin
 */

export const PERMISSION_RANK: Record<string, number> = {
  visitante: 0,
  usuario_regular: 10,
  usuario_premium: 20,
  suporte: 30,
  moderador: 40,
  gerente: 60,
  administrador: 80,
  super_admin: 100,
};

/** Rank mínimo para entrar no painel (leitura operacional). */
export const PANEL_MIN_PERMISSION = "suporte";

export const ACL_MIN_RANK = {
  "users.read": PERMISSION_RANK.administrador,
  "users.write": PERMISSION_RANK.administrador,
  "users.delete": PERMISSION_RANK.administrador,

  "providers.read": PERMISSION_RANK.gerente,
  "providers.write": PERMISSION_RANK.administrador,

  "hotspots.read": PERMISSION_RANK.suporte,
  "hotspots.write": PERMISSION_RANK.gerente,
  "hotspots.delete": PERMISSION_RANK.administrador,

  "plans.read": PERMISSION_RANK.suporte,
  "plans.write": PERMISSION_RANK.gerente,

  "vouchers.read": PERMISSION_RANK.suporte,
  "vouchers.write": PERMISSION_RANK.moderador,
  "vouchers.export": PERMISSION_RANK.gerente,

  "gateways.read": PERMISSION_RANK.gerente,
  "gateways.write": PERMISSION_RANK.administrador,

  "orders.read": PERMISSION_RANK.suporte,
  "orders.cancel": PERMISSION_RANK.gerente,
  "orders.simulate": PERMISSION_RANK.administrador,
  "orders.retry": PERMISSION_RANK.moderador,

  "clients.read": PERMISSION_RANK.suporte,
  "clients.write": PERMISSION_RANK.moderador,

  "mikrotik.read": PERMISSION_RANK.suporte,
  "mikrotik.write": PERMISSION_RANK.gerente,
  "mikrotik.danger": PERMISSION_RANK.administrador,

  "reports.read": PERMISSION_RANK.gerente,
  "devices.read": PERMISSION_RANK.suporte,
  "connection_logs.read": PERMISSION_RANK.suporte,
} as const;

export type AclAction = keyof typeof ACL_MIN_RANK;

export type NavAcl = {
  href: string;
  /** Qualquer uma dessas ações libera o item do menu. */
  actions: AclAction[];
};

/** Menu principal → ação mínima da API. */
export const NAV_ACL: NavAcl[] = [
  { href: "/home", actions: ["hotspots.read", "clients.read", "orders.read"] },
  { href: "/providers", actions: ["providers.read"] },
  { href: "/hotspots", actions: ["hotspots.read"] },
  { href: "/plans", actions: ["plans.read"] },
  { href: "/vouchers", actions: ["vouchers.read"] },
  { href: "/payment-gateways", actions: ["gateways.read"] },
  { href: "/orders", actions: ["orders.read"] },
  { href: "/clients", actions: ["clients.read"] },
  { href: "/devices", actions: ["devices.read"] },
  { href: "/users", actions: ["users.read"] },
];

/**
 * Rotas protegidas no middleware (prefixo → ações).
 * Ordem: prefixos mais específicos primeiro.
 */
export const ROUTE_ACL: { prefix: string; actions: AclAction[] }[] = [
  { prefix: "/users", actions: ["users.read"] },
  { prefix: "/user/insert", actions: ["users.write"] },
  { prefix: "/user", actions: ["users.read"] },

  { prefix: "/provider/hotspot/insert", actions: ["hotspots.write"] },
  { prefix: "/provider/hotspot/cadastro", actions: ["hotspots.write"] },
  { prefix: "/provider/hotspot/edit", actions: ["mikrotik.write"] },
  { prefix: "/provider/hotspot", actions: ["hotspots.read"] },
  { prefix: "/provider/hotspots", actions: ["hotspots.read"] },
  { prefix: "/provider/insert", actions: ["providers.write"] },
  { prefix: "/provider/show", actions: ["providers.write"] },
  { prefix: "/providers", actions: ["providers.read"] },
  { prefix: "/provider", actions: ["providers.read"] },

  { prefix: "/payment-gateway/insert", actions: ["gateways.write"] },
  { prefix: "/payment-gateways", actions: ["gateways.read"] },
  { prefix: "/payment-gateway", actions: ["gateways.read"] },

  { prefix: "/plan/insert", actions: ["plans.write"] },
  { prefix: "/plans", actions: ["plans.read"] },
  { prefix: "/plan", actions: ["plans.read"] },

  { prefix: "/voucher/generate", actions: ["vouchers.write"] },
  { prefix: "/vouchers", actions: ["vouchers.read"] },
  { prefix: "/voucher", actions: ["vouchers.read"] },

  { prefix: "/orders", actions: ["orders.read"] },
  { prefix: "/order", actions: ["orders.read"] },

  { prefix: "/hotspots", actions: ["hotspots.read"] },
  { prefix: "/clients", actions: ["clients.read"] },
  { prefix: "/client/insert", actions: ["clients.write"] },
  { prefix: "/client", actions: ["clients.read"] },
  { prefix: "/devices", actions: ["devices.read"] },
  { prefix: "/device", actions: ["devices.read"] },
  { prefix: "/home", actions: ["hotspots.read", "clients.read", "orders.read"] },
];

export function isSuperAdmin(permission?: string | null): boolean {
  return permission === "super_admin";
}

export function permissionRank(permission?: string | null): number {
  if (!permission) return -1;
  return PERMISSION_RANK[permission] ?? -1;
}

export function canPerform(permission: string | null | undefined, action: AclAction): boolean {
  if (isSuperAdmin(permission)) return true;
  const needed = ACL_MIN_RANK[action];
  if (needed == null) return false;
  return permissionRank(permission) >= needed;
}

export function canPerformAny(
  permission: string | null | undefined,
  actions: AclAction[]
): boolean {
  return actions.some((action) => canPerform(permission, action));
}

/** Painel exige pelo menos suporte (documentação ACL). */
export function canAccessPanel(permission?: string | null): boolean {
  if (isSuperAdmin(permission)) return true;
  return permissionRank(permission) >= PERMISSION_RANK[PANEL_MIN_PERMISSION];
}

export function navVisible(permission: string | null | undefined, href: string): boolean {
  const rule = NAV_ACL.find((item) => item.href === href);
  if (!rule) return canAccessPanel(permission);
  return canPerformAny(permission, rule.actions);
}

export function routeAllowed(permission: string | null | undefined, pathname: string): boolean {
  if (!canAccessPanel(permission)) return false;
  const match = ROUTE_ACL.find(
    (rule) => pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`)
  );
  if (!match) return true;
  return canPerformAny(permission, match.actions);
}
