"use client";

import IProvider from "@/app/interface/IProviders";

export const GATEWAY_PROVIDERS = [
  "mercado_pago",
  "pagseguro",
  "stripe",
  "paypal",
  "asaas",
  "other",
] as const;

export const GATEWAY_STATUSES = ["ativo", "inativo", "bloqueado", "pendente", "rejeitado", "cancelado"];

export type GatewayForm = {
  name: string;
  provider: string;
  ispID: string;
  hsID: string;
  public_key: string;
  access_token: string;
  client_id: string;
  client_secret: string;
  webhook_secret: string;
  webhook_path: string;
  sandbox: boolean;
  status: string;
  extra: string;
};

export const emptyGateway = (): GatewayForm => ({
  name: "",
  provider: "mercado_pago",
  ispID: "",
  hsID: "",
  public_key: "",
  access_token: "",
  client_id: "",
  client_secret: "",
  webhook_secret: "",
  webhook_path: "",
  sandbox: true,
  status: "ativo",
  extra: "",
});

type HotspotOption = { id?: number; nome?: string; isp?: { id?: number } };

export function GatewayFields({
  form,
  providers,
  hotspots,
  onChange,
  secretsOptional = false,
}: {
  form: GatewayForm;
  providers: IProvider[];
  hotspots: HotspotOption[];
  onChange: (key: keyof GatewayForm, value: string | boolean) => void;
  secretsOptional?: boolean;
}) {
  const filteredHotspots = form.ispID
    ? hotspots.filter((hotspot) => String(hotspot.isp?.id ?? "") === form.ispID)
    : hotspots;

  return (
    <>
      <h2 className="form-span">Gateway</h2>
      <label>Nome<input value={form.name} onChange={(event) => onChange("name", event.target.value)} required /></label>
      <label>
        Provedor
        <select value={form.provider} onChange={(event) => onChange("provider", event.target.value)} required>
          {GATEWAY_PROVIDERS.map((provider) => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
          {GATEWAY_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <label>
        Sandbox
        <select
          value={form.sandbox ? "yes" : "no"}
          onChange={(event) => onChange("sandbox", event.target.value === "yes")}
        >
          <option value="yes">Sim</option>
          <option value="no">Não</option>
        </select>
      </label>

      <h2 className="form-span">Escopo</h2>
      <label>
        ISP
        <select value={form.ispID} onChange={(event) => onChange("ispID", event.target.value)}>
          <option value="">Opcional</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>{provider.nome}</option>
          ))}
        </select>
      </label>
      <label>
        Hotspot
        <select value={form.hsID} onChange={(event) => onChange("hsID", event.target.value)}>
          <option value="">Todo o ISP</option>
          {filteredHotspots.map((hotspot) => (
            <option key={hotspot.id} value={hotspot.id}>{hotspot.nome}</option>
          ))}
        </select>
      </label>

      <h2 className="form-span">Credenciais</h2>
      <label>Chave pública<input value={form.public_key} onChange={(event) => onChange("public_key", event.target.value)} /></label>
      <label>
        Access token
        <input
          type="password"
          value={form.access_token}
          onChange={(event) => onChange("access_token", event.target.value)}
          autoComplete="new-password"
          placeholder={secretsOptional ? "Em branco = manter" : undefined}
        />
      </label>
      <label>Client ID<input value={form.client_id} onChange={(event) => onChange("client_id", event.target.value)} /></label>
      <label>
        Client secret
        <input
          type="password"
          value={form.client_secret}
          onChange={(event) => onChange("client_secret", event.target.value)}
          autoComplete="new-password"
          placeholder={secretsOptional ? "Em branco = manter" : undefined}
        />
      </label>
      <label>
        Webhook secret
        <input
          type="password"
          value={form.webhook_secret}
          onChange={(event) => onChange("webhook_secret", event.target.value)}
          autoComplete="new-password"
          placeholder={secretsOptional ? "Em branco = manter" : undefined}
        />
      </label>
      <label>
        Webhook path
        <input
          value={form.webhook_path}
          onChange={(event) => onChange("webhook_path", event.target.value)}
          placeholder="/api/payments/webhook/mercado_pago"
        />
      </label>
      <label className="form-full">
        Extra (JSON)
        <textarea
          value={form.extra}
          onChange={(event) => onChange("extra", event.target.value)}
          rows={4}
          placeholder='{"chave":"valor"}'
          style={{ minHeight: 96, padding: 12, border: "1px solid var(--line-strong)", borderRadius: 12, resize: "vertical" }}
        />
      </label>
    </>
  );
}

export function gatewayPayload(form: GatewayForm) {
  let extra: Record<string, unknown> | null = null;
  if (form.extra.trim()) {
    extra = JSON.parse(form.extra) as Record<string, unknown>;
  }

  return {
    name: form.name,
    provider: form.provider,
    ispID: form.ispID ? Number(form.ispID) : null,
    hsID: form.hsID ? Number(form.hsID) : null,
    public_key: form.public_key || undefined,
    access_token: form.access_token || undefined,
    client_id: form.client_id || undefined,
    client_secret: form.client_secret || undefined,
    webhook_secret: form.webhook_secret || undefined,
    webhook_path: form.webhook_path || undefined,
    sandbox: form.sandbox,
    status: form.status,
    extra,
  };
}
