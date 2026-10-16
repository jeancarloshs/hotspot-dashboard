"use client";

import IProvider from "@/app/interface/IProviders";

export type PlanForm = {
  name: string;
  description: string;
  price: string;
  rate_limit: string;
  session_timeout: string;
  idle_timeout: string;
  shared_users: string;
  validity_hours: string;
  ispID: string;
  hsID: string;
  mk_profile: string;
  sync_mikrotik: boolean;
  status: string;
};

export const PLAN_STATUSES = ["ativo", "inativo", "bloqueado", "pendente", "rejeitado", "cancelado"];

export const emptyPlan = (): PlanForm => ({
  name: "",
  description: "",
  price: "",
  rate_limit: "",
  session_timeout: "",
  idle_timeout: "",
  shared_users: "1",
  validity_hours: "",
  ispID: "",
  hsID: "",
  mk_profile: "",
  sync_mikrotik: true,
  status: "ativo",
});

type HotspotOption = { id?: number; nome?: string; isp?: { id?: number } };

export function PlanFields({
  form,
  providers,
  hotspots,
  onChange,
}: {
  form: PlanForm;
  providers: IProvider[];
  hotspots: HotspotOption[];
  onChange: (key: keyof PlanForm, value: string | boolean) => void;
}) {
  const filteredHotspots = form.ispID
    ? hotspots.filter((hotspot) => String(hotspot.isp?.id ?? "") === form.ispID)
    : hotspots;

  return (
    <>
      <h2 className="form-span">Plano</h2>
      <label>Nome<input value={form.name} onChange={(event) => onChange("name", event.target.value)} required /></label>
      <label>Descrição<input value={form.description} onChange={(event) => onChange("description", event.target.value)} /></label>
      <label>Preço<input value={form.price} onChange={(event) => onChange("price", event.target.value)} inputMode="decimal" placeholder="5.90" /></label>
      <label>
        Status
        <select value={form.status} onChange={(event) => onChange("status", event.target.value)}>
          {PLAN_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>

      <h2 className="form-span">Limites</h2>
      <label>Banda<input value={form.rate_limit} onChange={(event) => onChange("rate_limit", event.target.value)} placeholder="5M/5M" /></label>
      <label>Sessão<input value={form.session_timeout} onChange={(event) => onChange("session_timeout", event.target.value)} placeholder="1h" /></label>
      <label>Ociosidade<input value={form.idle_timeout} onChange={(event) => onChange("idle_timeout", event.target.value)} placeholder="30m" /></label>
      <label>Usuários compartilhados<input value={form.shared_users} onChange={(event) => onChange("shared_users", event.target.value)} /></label>
      <label>Validade (horas)<input value={form.validity_hours} onChange={(event) => onChange("validity_hours", event.target.value)} inputMode="numeric" placeholder="24" /></label>
      <label>Perfil MikroTik<input value={form.mk_profile} onChange={(event) => onChange("mk_profile", event.target.value)} placeholder="1h-5m" /></label>

      <h2 className="form-span">Vínculos</h2>
      <label>
        Provedor
        <select value={form.ispID} onChange={(event) => onChange("ispID", event.target.value)}>
          <option value="">Opcional</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>{provider.nome}</option>
          ))}
        </select>
      </label>
      <label>
        Hotspot (sync)
        <select value={form.hsID} onChange={(event) => onChange("hsID", event.target.value)}>
          <option value="">Opcional</option>
          {filteredHotspots.map((hotspot) => (
            <option key={hotspot.id} value={hotspot.id}>{hotspot.nome}</option>
          ))}
        </select>
      </label>
      <label className="form-full">
        <span>Sincronizar perfil no MikroTik</span>
        <select
          value={form.sync_mikrotik ? "yes" : "no"}
          onChange={(event) => onChange("sync_mikrotik", event.target.value === "yes")}
        >
          <option value="yes">Sim</option>
          <option value="no">Não</option>
        </select>
      </label>
    </>
  );
}

export function planPayload(form: PlanForm) {
  return {
    name: form.name,
    description: form.description || undefined,
    price: form.price ? Number(form.price.replace(",", ".")) : null,
    rate_limit: form.rate_limit || undefined,
    session_timeout: form.session_timeout || undefined,
    idle_timeout: form.idle_timeout || undefined,
    shared_users: form.shared_users || undefined,
    validity_hours: form.validity_hours ? Number(form.validity_hours) : null,
    ispID: form.ispID ? Number(form.ispID) : null,
    hsID: form.hsID ? Number(form.hsID) : null,
    mk_profile: form.mk_profile || undefined,
    sync_mikrotik: form.sync_mikrotik,
    status: form.status,
  };
}
