/** Status de entidade do pedido (espelha a API / StatusList + usado/expirado). */
export const ORDER_ENTITY_STATUSES = [
  "pendente",
  "ativo",
  "usado",
  "cancelado",
  "rejeitado",
  "expirado",
  "bloqueado",
  "inativo",
  "deletado",
] as const;

/** Filtro da listagem — os mais usados no ciclo de pagamento. */
export const ORDER_FILTER_STATUSES = ["", "pendente", "ativo", "usado", "cancelado", "rejeitado", "expirado"] as const;

/** Pagamento concluído (voucher emitido; `usado` quando já provisionado). */
const PAID = new Set(["ativo", "usado"]);

/** Pedido encerrado sem sucesso ou revogado. */
const CLOSED = new Set(["cancelado", "rejeitado", "expirado", "bloqueado", "deletado", "inativo"]);

const PAYMENT_LABELS: Record<"concluida" | "nao_concluida" | "em_aberto", string> = {
  concluida: "Pagamento concluído",
  nao_concluida: "Pagamento não concluído",
  em_aberto: "Pagamento em aberto",
};

const PROVISION_LABELS: Record<string, string> = {
  ready: "Provisionado",
  provision_failed: "Falha",
  paid_pending_provision: "Pendente",
  waiting_payment: "Aguardando pagamento",
  closed: "Encerrado",
};

export type PaymentStatus = "concluida" | "nao_concluida" | "em_aberto";

export function normalizeOrderStatus(status?: string | null) {
  return String(status || "").trim().toLowerCase();
}

export function isPaidOrderStatus(status?: string | null) {
  return PAID.has(normalizeOrderStatus(status));
}

export function isClosedOrderStatus(status?: string | null) {
  return CLOSED.has(normalizeOrderStatus(status));
}

export function paymentOutcome(status?: string | null): {
  payment_status: PaymentStatus;
  payment_status_label: string;
} {
  const s = normalizeOrderStatus(status);
  let payment_status: PaymentStatus = "em_aberto";
  if (PAID.has(s)) payment_status = "concluida";
  else if (CLOSED.has(s)) payment_status = "nao_concluida";

  return {
    payment_status,
    payment_status_label: PAYMENT_LABELS[payment_status],
  };
}

export function paymentStatusLabel(
  paymentStatus?: string | null,
  paymentStatusLabel?: string | null,
  entityStatus?: string | null,
) {
  if (paymentStatusLabel?.trim()) return paymentStatusLabel.trim();
  const key = String(paymentStatus || "").toLowerCase() as PaymentStatus;
  if (key in PAYMENT_LABELS) return PAYMENT_LABELS[key];
  return paymentOutcome(entityStatus).payment_status_label;
}

export function provisionLabel(opts: {
  provision_status?: string | null;
  mikrotik_provisioned?: boolean;
  mikrotik_error?: string | null;
  status?: string | null;
}) {
  const ps = String(opts.provision_status || "").toLowerCase();
  if (ps && PROVISION_LABELS[ps]) return PROVISION_LABELS[ps];
  if (opts.mikrotik_provisioned) return PROVISION_LABELS.ready;
  if (opts.mikrotik_error) return PROVISION_LABELS.provision_failed;
  if (isPaidOrderStatus(opts.status)) return PROVISION_LABELS.paid_pending_provision;
  if (normalizeOrderStatus(opts.status) === "pendente") return PROVISION_LABELS.waiting_payment;
  if (isClosedOrderStatus(opts.status)) return PROVISION_LABELS.closed;
  return "—";
}

export function isMercadoPago(provider?: string | null) {
  const value = String(provider || "").toLowerCase().replace(/[\s-]+/g, "_");
  return value === "mercado_pago" || value === "mercadopago";
}
