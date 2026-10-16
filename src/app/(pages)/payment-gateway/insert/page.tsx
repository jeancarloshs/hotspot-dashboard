"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllProviders } from "@/actions/get-all-provideres";
import { createPaymentGateway } from "@/actions/payment-gateways";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { emptyGateway, GatewayFields, gatewayPayload, GatewayForm } from "@/app/components/_ui/payment/GatewayFields";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível salvar o gateway.";
}

const InsertGatewayPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string; isp?: { id?: number } }[]>([]);
  const [form, setForm] = useState<GatewayForm>(emptyGateway);

  useEffect(() => {
    const load = async () => {
      const [providerResponse, hotspotResponse] = await Promise.all([
        getAllProviders(),
        getAllHotspots(),
      ]);
      setProviders(asList<IProvider>(providerResponse));
      setHotspots(asList(hotspotResponse));
    };
    load();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await createPaymentGateway(gatewayPayload(form));
      if (response.status === 201 || response.status === 200) {
        router.push("/payment-gateways");
        return;
      }
      setError(messageFrom(response.data));
    } catch {
      setError("JSON do campo Extra inválido.");
    }
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Tokens e secrets não voltam nas listagens. Use sandbox para testes.</p>
          <GatewayFields
            form={form}
            providers={providers}
            hotspots={hotspots}
            onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
          />
          {error ? <p className="error-message form-span">{error}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/payment-gateways")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar gateway"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default InsertGatewayPage;
