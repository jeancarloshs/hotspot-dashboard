"use client";

import { getPaymentOrderByNumber, syncPayment } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { isClosedOrderStatus, paymentStatusLabel, provisionLabel } from "@/app/lib/order-payment";
import { FormEvent, useState } from "react";

type PublicOrder = {
  order_number?: string;
  status?: string;
  payment_status?: string;
  payment_status_label?: string;
  value?: string | number;
  currency?: string;
  paid_at?: string;
  checkout_url?: string;
  voucher_code?: string | null;
  plan?: { name?: string } | null;
  credentials?: { username?: string; password?: string; profile?: string } | null;
  mikrotik_provisioned?: boolean;
  mikrotik_error?: string | null;
  provision_status?: string;
};

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

function money(value?: string | number, currency = "BRL") {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return value != null && value !== "" ? String(value) : "—";
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });
}

const OrderStatusPage = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    setOrder(null);
    const response = await getPaymentOrderByNumber(orderNumber.trim());
    if (!response) {
      setError("Pedido não encontrado.");
      setLoading(false);
      return;
    }
    setOrder(response as PublicOrder);
    setLoading(false);
  };

  const handleSync = async () => {
    if (!order?.order_number) return;
    setSyncing(true);
    setError("");
    setInfo("");
    const response = await syncPayment(order.order_number);
    if (response.status < 200 || response.status >= 300) {
      setError(messageFrom(response.data, "Não foi possível sincronizar o pagamento."));
      setSyncing(false);
      return;
    }
    setInfo(messageFrom(response.data, "Pagamento sincronizado."));
    const refreshed = await getPaymentOrderByNumber(order.order_number);
    if (refreshed) setOrder(refreshed as PublicOrder);
    setSyncing(false);
  };

  const canSync = order ? !isClosedOrderStatus(order.status) : false;
  const payLabel = order
    ? paymentStatusLabel(order.payment_status, order.payment_status_label, order.status)
    : "";

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Consulta pública do status pelo número do pedido (ex.: ORD-XXXX-YYYY). Depois de consultar, dá para sincronizar o pagamento no Mercado Pago.</p>
          <label className="form-full">
            Número do pedido
            <input
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              placeholder="ORD-XXXX-YYYY"
              required
            />
          </label>
          {error ? <p className="error-message form-full">{error}</p> : null}
          <div className="form-actions form-full">
            <button type="submit" className="btn btn--solid" disabled={loading}>
              {loading ? "Consultando..." : "Consultar"}
            </button>
          </div>
        </form>
      </section>

      {order ? (
        <section className="identity-grid" style={{ marginTop: 16 }}>
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
            <strong>{order.plan?.name || "—"}</strong>
          </div>
          <div className="fact">
            <span>Voucher</span>
            <strong>{order.voucher_code || order.credentials?.username || "—"}</strong>
          </div>
          <div className="fact">
            <span>Pago em</span>
            <strong>{order.paid_at ? new Date(order.paid_at).toLocaleString("pt-BR") : "—"}</strong>
          </div>
          <div className="fact">
            <span>MikroTik</span>
            <strong>{provisionLabel(order)}</strong>
          </div>
          <div className="fact">
            <span>Erro de provisionamento</span>
            <strong>{order.mikrotik_error || "—"}</strong>
          </div>
        </section>
      ) : null}

      {order ? (
        <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {info ? <p className="edit-note" style={{ width: "100%" }}>{info}</p> : null}
          {canSync ? (
            <button type="button" className="btn" onClick={handleSync} disabled={syncing || loading}>
              {syncing ? "Sincronizando..." : "Sincronizar Mercado Pago"}
            </button>
          ) : null}
        </div>
      ) : null}
    </SideBar>
  );
};

export default OrderStatusPage;
