"use client";

import { cancelPayment, getOrder, retryProvision, simulatePayment, syncPayment } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { useAcl } from "@/app/hooks/use-acl";
import { useApiFeedback } from "@/app/hooks/use-api-feedback";
import {
  isClosedOrderStatus,
  isMercadoPago,
  normalizeOrderStatus,
  paymentStatusLabel,
  provisionLabel,
} from "@/app/lib/order-payment";
import { messageFrom } from "@/app/lib/message";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type OrderMetadata = {
  voucher_code?: string;
  mikrotik_provisioned?: boolean;
  mikrotik_error?: string | null;
  credentials?: { username?: string; password?: string; profile?: string } | null;
};

type OrderRecord = {
  id?: number;
  order_number?: string;
  status?: string;
  payment_status?: string;
  payment_status_label?: string;
  value?: string | number;
  currency?: string;
  payment_method?: string;
  external_id?: string;
  external_status?: string;
  checkout_url?: string;
  paid_at?: string;
  created_at?: string;
  hsID?: number | null;
  metadata?: OrderMetadata | null;
  plan?: { id?: number; name?: string; price?: number };
  gateway?: { id?: number; name?: string; provider?: string; sandbox?: boolean };
  hotspot?: { id?: number; nome?: string };
};

function unwrap(value: unknown): OrderRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.order_number || record.id) return record as OrderRecord;
  if (record.order && typeof record.order === "object") return record.order as OrderRecord;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as OrderRecord;
  }
  return null;
}

function money(value?: string | number, currency = "BRL") {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return value != null && value !== "" ? String(value) : "—";
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });
}

const OrderShowPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const { can } = useAcl();
  const { error, fromResponse, clearError } = useApiFeedback();
  const id = React.use(params).slug[0];
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [info, setInfo] = useState("");
  const [pending, setPending] = useState<"simulate" | "cancel" | "sync" | "retry" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = async () => {
    const response = await getOrder(id);
    const record = unwrap(response);
    if (!record) {
      setMissing(true);
      return;
    }
    setOrder(record);
  };

  useEffect(() => {
    load();
  }, [id]);

  const runAction = async (
    kind: "simulate" | "cancel" | "sync" | "retry",
    action: (orderNumber: string) => Promise<{ status: number; data: unknown }>,
    successFallback: string,
    errorFallback: string,
  ) => {
    if (!order?.order_number) return;
    setPending(kind);
    clearError();
    setInfo("");
    const response = await action(order.order_number);
    if (response.status >= 200 && response.status < 300) {
      setInfo(messageFrom(response.data, successFallback, response.status));
      setConfirmCancel(false);
      await load();
      setPending(null);
      return;
    }
    fromResponse(response.status, response.data, errorFallback);
    setPending(null);
  };

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Pedido não encontrado.</div>
      </SideBar>
    );
  }

  if (!order) {
    return (
      <SideBar>
        <div className="empty-state">Carregando pedido...</div>
      </SideBar>
    );
  }

  const status = normalizeOrderStatus(order.status);
  const closed = isClosedOrderStatus(status);
  const meta = order.metadata && typeof order.metadata === "object" ? order.metadata : null;
  const voucherCode = meta?.voucher_code || meta?.credentials?.username;
  const canSimulate = can("orders.simulate") && order.gateway?.sandbox !== false && status === "pendente";
  const canSync = isMercadoPago(order.gateway?.provider) && !closed;
  const canRetry = can("orders.retry")
    && status === "ativo"
    && Boolean(order.hotspot?.id || order.hsID)
    && meta?.mikrotik_provisioned !== true;
  const canCancel = can("orders.cancel") && !closed;
  const busy = pending !== null;
  const payLabel = paymentStatusLabel(order.payment_status, order.payment_status_label, order.status);

  return (
    <SideBar>
      <section className="identity-grid">
        <div className="fact">
          <span>Número</span>
          <strong>{order.order_number || "—"}</strong>
        </div>
        <div className="fact">
          <span>Status</span>
          <strong><StatusPill value={order.status} /></strong>
        </div>
        <div className="fact">
          <span>Pagamento</span>
          <strong><StatusPill value={payLabel} /></strong>
        </div>
        <div className="fact">
          <span>Valor</span>
          <strong>{money(order.value, order.currency)}</strong>
        </div>
        <div className="fact">
          <span>Plano</span>
          <strong>{order.plan?.name || order.plan?.id || "—"}</strong>
        </div>
        <div className="fact">
          <span>Gateway</span>
          <strong>
            {order.gateway?.name || order.gateway?.provider || "—"}
            {order.gateway?.sandbox ? " (sandbox)" : ""}
          </strong>
        </div>
        <div className="fact">
          <span>Hotspot</span>
          <strong>{order.hotspot?.nome || "—"}</strong>
        </div>
        <div className="fact">
          <span>Método</span>
          <strong>{order.payment_method || "—"}</strong>
        </div>
        <div className="fact">
          <span>Pago em</span>
          <strong>{order.paid_at ? new Date(order.paid_at).toLocaleString("pt-BR") : "—"}</strong>
        </div>
        <div className="fact">
          <span>Voucher</span>
          <strong>{voucherCode || "—"}</strong>
        </div>
        <div className="fact">
          <span>MikroTik</span>
          <strong>{provisionLabel({ ...meta, status: order.status })}</strong>
        </div>
        <div className="fact">
          <span>Erro de provisionamento</span>
          <strong>{meta?.mikrotik_error || "—"}</strong>
        </div>
        <div className="fact">
          <span>Checkout</span>
          <strong>
            {order.checkout_url ? (
              <a href={order.checkout_url} target="_blank" rel="noreferrer">Abrir link</a>
            ) : "—"}
          </strong>
        </div>
      </section>

      {error ? <p className="error-message">{error}</p> : null}
      {info ? <p className="edit-note">{info}</p> : null}
      {confirmCancel ? (
        <div className="confirm-reboot">
          <p>Cancelar este pedido. Se já estiver pago, o voucher e o acesso no MikroTik são revogados.</p>
          <div className="toolbar-actions">
            <button type="button" className="btn" onClick={() => setConfirmCancel(false)} disabled={busy}>Voltar</button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => runAction("cancel", cancelPayment, "Pedido cancelado.", "Não foi possível cancelar o pedido.")}
              disabled={busy}
            >
              {pending === "cancel" ? "Cancelando..." : "Confirmar cancelamento"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={() => router.push("/orders")}>Voltar</button>
        {canSimulate ? (
          <button
            type="button"
            className="btn btn--solid"
            onClick={() => runAction("simulate", simulatePayment, "Pagamento simulado com sucesso.", "Não foi possível simular o pagamento.")}
            disabled={busy}
          >
            {pending === "simulate" ? "Simulando..." : "Simular pagamento (sandbox)"}
          </button>
        ) : null}
        {canSync ? (
          <button
            type="button"
            className="btn"
            onClick={() => runAction("sync", syncPayment, "Pagamento sincronizado.", "Não foi possível sincronizar o pagamento.")}
            disabled={busy}
          >
            {pending === "sync" ? "Sincronizando..." : "Sincronizar Mercado Pago"}
          </button>
        ) : null}
        {canRetry ? (
          <button
            type="button"
            className="btn"
            onClick={() => runAction("retry", retryProvision, "Provisionamento concluído.", "Não foi possível provisionar no MikroTik.")}
            disabled={busy}
          >
            {pending === "retry" ? "Provisionando..." : "Tentar provisionamento"}
          </button>
        ) : null}
        {canCancel && !confirmCancel ? (
          <button type="button" className="btn btn--danger" onClick={() => setConfirmCancel(true)} disabled={busy}>
            Cancelar pedido
          </button>
        ) : null}
      </div>
    </SideBar>
  );
};

export default OrderShowPage;
