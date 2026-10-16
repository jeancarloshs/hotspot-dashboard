"use client";

import { getPaymentOrderByNumber } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { FormEvent, useState } from "react";

type PublicOrder = {
  order_number?: string;
  status?: string;
  value?: string | number;
  currency?: string;
  paid_at?: string;
  checkout_url?: string;
  voucher_code?: string | null;
  plan?: { name?: string } | null;
};

function money(value?: string | number, currency = "BRL") {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return value != null && value !== "" ? String(value) : "—";
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });
}

const OrderStatusPage = () => {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<PublicOrder | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
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

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Consulta pública do status pelo número do pedido (ex.: ORD-XXXX-YYYY).</p>
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
            <span>Valor</span>
            <strong>{money(order.value, order.currency)}</strong>
          </div>
          <div className="fact">
            <span>Plano</span>
            <strong>{order.plan?.name || "—"}</strong>
          </div>
          <div className="fact">
            <span>Voucher</span>
            <strong>{order.voucher_code || "—"}</strong>
          </div>
          <div className="fact">
            <span>Pago em</span>
            <strong>{order.paid_at ? new Date(order.paid_at).toLocaleString("pt-BR") : "—"}</strong>
          </div>
        </section>
      ) : null}
    </SideBar>
  );
};

export default OrderStatusPage;
