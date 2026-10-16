"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllProviders } from "@/actions/get-all-provideres";
import { deletePaymentGateway, getPaymentGateway, updatePaymentGateway } from "@/actions/payment-gateways";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import {
  emptyGateway,
  GATEWAY_PROVIDERS,
  GATEWAY_STATUSES,
  GatewayFields,
  gatewayPayload,
  GatewayForm,
} from "@/app/components/_ui/payment/GatewayFields";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

function unwrap(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.name || record.id || record.provider) return record;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  return null;
}

const GatewayPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string; isp?: { id?: number } }[]>([]);
  const [form, setForm] = useState<GatewayForm>(emptyGateway);

  useEffect(() => {
    const load = async () => {
      const [gatewayResponse, providerResponse, hotspotResponse] = await Promise.all([
        getPaymentGateway(id),
        getAllProviders(),
        getAllHotspots(),
      ]);
      setProviders(asList<IProvider>(providerResponse));
      setHotspots(asList(hotspotResponse));
      const gateway = unwrap(gatewayResponse);
      if (!gateway) {
        setMissing(true);
        return;
      }
      const isp = gateway.isp && typeof gateway.isp === "object" ? gateway.isp as { id?: number } : null;
      const hotspot = gateway.hotspot && typeof gateway.hotspot === "object" ? gateway.hotspot as { id?: number } : null;
      const provider = String(gateway.provider || "mercado_pago");
      const status = String(gateway.status || "ativo").toLowerCase();
      setForm({
        name: String(gateway.name || ""),
        provider: GATEWAY_PROVIDERS.includes(provider as typeof GATEWAY_PROVIDERS[number]) ? provider : "other",
        ispID: String(gateway.ispID ?? isp?.id ?? ""),
        hsID: String(gateway.hsID ?? hotspot?.id ?? ""),
        public_key: String(gateway.public_key || ""),
        access_token: "",
        client_id: String(gateway.client_id || ""),
        client_secret: "",
        webhook_secret: "",
        webhook_path: String(gateway.webhook_path || ""),
        sandbox: gateway.sandbox !== false,
        status: GATEWAY_STATUSES.includes(status) ? status : "ativo",
        extra: gateway.extra && typeof gateway.extra === "object" ? JSON.stringify(gateway.extra, null, 2) : "",
      });
    };
    load();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await updatePaymentGateway(id, gatewayPayload(form));
      if (response.status === 200) {
        router.push("/payment-gateways");
        return;
      }
      setError(messageFrom(response.data, "Não foi possível salvar o gateway."));
    } catch {
      setError("JSON do campo Extra inválido.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deletePaymentGateway(id);
    if (response.status === 200) {
      router.push("/payment-gateways");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível excluir o gateway."));
    setDeleting(false);
  };

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Gateway não encontrado.</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Secrets em branco mantêm o valor atual no servidor.</p>
          <GatewayFields
            form={form}
            providers={providers}
            hotspots={hotspots}
            secretsOptional
            onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
          />
          {error ? <p className="error-message form-span">{error}</p> : null}
          {confirmDelete ? (
            <div className="confirm-reboot form-full">
              <p>Excluir este gateway remove as credenciais de pagamento do painel.</p>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/payment-gateways")}>Voltar</button>
            {confirmDelete ? null : (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir gateway</button>
            )}
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar gateway"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default GatewayPage;
