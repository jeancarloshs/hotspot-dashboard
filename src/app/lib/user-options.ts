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
