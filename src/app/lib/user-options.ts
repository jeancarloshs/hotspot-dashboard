import { permissionRank } from "@/app/lib/acl";

export const PERMISSIONS = [
  "super_admin",
  "administrador",
  "gerente",
  "moderador",
  "suporte",
  "usuario_premium",
  "usuario_regular",
  "visitante",
] as const;

/** Níveis que entram no painel (ACL da API). */
export const PANEL_PERMISSIONS = [
  "super_admin",
  "administrador",
  "gerente",
  "moderador",
  "suporte",
] as const;

export const PERMISSION_HINTS: Record<(typeof PERMISSIONS)[number], string> = {
  super_admin: "Tudo + multi-ISP",
  administrador: "Users, gateways, MK perigoso, deletes",
  gerente: "Planos/hotspots write, relatórios, export",
  moderador: "Gerar vouchers, editar clientes, retry provision",
  suporte: "Leitura operacional (clientes, pedidos, MK read)",
  usuario_premium: "Sem acesso ao painel",
  usuario_regular: "Sem acesso ao painel",
  visitante: "Sem acesso ao painel",
};

export const USER_STATUSES = ["ativo", "inativo", "bloqueado", "pendente", "rejeitado", "cancelado"] as const;

export function permissionLabel(value?: string | null) {
  if (!value?.trim()) return "—";
  return value
    .trim()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Opções de permissão que o usuário logado pode atribuir (não acima do próprio rank). */
export function assignablePermissions(actorPermission?: string | null): string[] {
  if (!actorPermission) {
    return PERMISSIONS.filter((permission) => permission !== "super_admin");
  }
  if (actorPermission === "super_admin") {
    return [...PERMISSIONS];
  }
  const actorRank = permissionRank(actorPermission);
  return PERMISSIONS.filter((permission) => permissionRank(permission) <= actorRank);
}
