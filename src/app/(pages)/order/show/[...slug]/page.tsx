"use client";

import { getOrder, simulatePayment } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type OrderRecord = {
  id?: number;
  order_number?: string;
  status?: string;
  value?: string | number;
  currency?: string;
  payment_method?: string;
  external_id?: string;
  external_status?: string;
  checkout_url?: string;
  paid_at?: string;
  created_at?: string;
  metadata?: { voucher_code?: string } | null;
  plan?: { id?: number; name?: string; price?: number };
  gateway?: { id?: number; name?: string; provider?: string; sandbox?: boolean };
  hotspot?: { id?: number; nome?: string };
};

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

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
  const id = React.use(params).slug[0];
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [simulating, setSimulating] = useState(false);

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

  const handleSimulate = async () => {
    if (!order?.order_number) return;
    setSimulating(true);
    setError("");
    setInfo("");
    const response = await simulatePayment(order.order_number);
    if (response.status >= 200 && response.status < 300) {
      setInfo(messageFrom(response.data, "Pagamento simulado com sucesso."));
      await load();
      setSimulating(false);
      return;
    }
    setError(messageFrom(response.data, "Não foi possível simular o pagamento."));
    setSimulating(false);
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

  const voucherCode = order.metadata && typeof order.metadata === "object"
    ? order.metadata.voucher_code
    : undefined;
  const canSimulate = order.gateway?.sandbox !== false
    && String(order.status || "").toLowerCase() !== "paid"
    && String(order.status || "").toLowerCase() !== "pago"
    && String(order.status || "").toLowerCase() !== "approved";

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

      <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={() => router.push("/orders")}>Voltar</button>
        {canSimulate ? (
          <button
            type="button"
            className="btn btn--solid"
            onClick={handleSimulate}
            disabled={simulating}
          >
            {simulating ? "Simulando..." : "Simular pagamento (sandbox)"}
          </button>
        ) : null}
      </div>
    </SideBar>
  );
};

export default OrderShowPage;
