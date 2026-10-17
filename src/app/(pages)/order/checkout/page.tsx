"use client";

import { getAllClients } from "@/actions/get-all-clients";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllPlans } from "@/actions/plans";
import { checkoutPayment, getPublicPaymentGateways } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { PAYMENT_METHODS } from "@/app/components/_ui/payment/GatewayFields";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type PlanOption = { id?: number; name?: string; price?: number };
type GatewayOption = { id?: number; name?: string; provider?: string; sandbox?: boolean };
type HotspotOption = { id?: number; nome?: string };
type ClientOption = { id?: number; nome_completo?: string; name?: string; email?: string };

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível criar o pedido.";
}

function unwrapOrderId(data: unknown): number | null {
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  if (typeof record.id === "number") return record.id;
  if (record.order && typeof record.order === "object") {
    const order = record.order as { id?: number };
    if (typeof order.id === "number") return order.id;
  }
  return null;
}

const CheckoutPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [gateways, setGateways] = useState<GatewayOption[]>([]);
  const [hotspots, setHotspots] = useState<HotspotOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [planID, setPlanID] = useState("");
  const [gatewayID, setGatewayID] = useState("");
  const [hsID, setHsID] = useState("");
  const [userID, setUserID] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0].value);

  useEffect(() => {
    const load = async () => {
      const [planResponse, hotspotResponse, clientResponse, gatewayResponse] = await Promise.all([
        getAllPlans(),
        getAllHotspots(),
        getAllClients(),
        getPublicPaymentGateways(),
      ]);
      setPlans(asList(planResponse));
      setHotspots(asList(hotspotResponse));
      setClients(asList(clientResponse));
      setGateways(asList(gatewayResponse));
    };
    load();
  }, []);

  useEffect(() => {
    const loadGateways = async () => {
      const response = await getPublicPaymentGateways(hsID ? Number(hsID) : undefined);
      setGateways(asList(response));
      setGatewayID("");
    };
    loadGateways();
  }, [hsID]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await checkoutPayment({
      planID: Number(planID),
      gatewayID: Number(gatewayID),
      hsID: hsID ? Number(hsID) : null,
      userID: userID ? Number(userID) : null,
      payment_method: paymentMethod && paymentMethod !== "all" ? paymentMethod : undefined,
    });
    if (response.status === 201 || response.status === 200) {
      const orderId = unwrapOrderId(response.data);
      if (orderId) {
        router.push(`/order/show/${orderId}`);
        return;
      }
      router.push("/orders");
      return;
    }
    setError(messageFrom(response.data));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">
            Cria um pedido pendente. Após o pagamento (webhook ou simulação sandbox), a API emite o voucher.
          </p>

          <label>
            Plano
            <select value={planID} onChange={(event) => setPlanID(event.target.value)} required>
              <option value="">Selecione</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                  {typeof plan.price === "number"
                    ? ` — ${plan.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Hotspot
            <select value={hsID} onChange={(event) => setHsID(event.target.value)}>
              <option value="">Opcional</option>
              {hotspots.map((hotspot) => (
                <option key={hotspot.id} value={hotspot.id}>{hotspot.nome}</option>
              ))}
            </select>
          </label>

          <label>
            Gateway
            <select value={gatewayID} onChange={(event) => setGatewayID(event.target.value)} required>
              <option value="">Selecione</option>
              {gateways.map((gateway) => (
                <option key={gateway.id} value={gateway.id}>
                  {gateway.name || gateway.provider}
                  {gateway.sandbox ? " (sandbox)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cliente
            <select value={userID} onChange={(event) => setUserID(event.target.value)}>
              <option value="">Opcional</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nome_completo || client.name || client.email || client.id}
                </option>
              ))}
            </select>
          </label>

          <label>
            Método de pagamento
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              required
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="error-message form-full">{error}</p> : null}

          <div className="form-actions form-full">
            <button type="button" className="btn" onClick={() => router.push("/orders")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>
              {loading ? "Criando..." : "Criar pedido"}
            </button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default CheckoutPage;
