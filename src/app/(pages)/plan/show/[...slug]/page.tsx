"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllProviders } from "@/actions/get-all-provideres";
import { deletePlan, getPlan, updatePlan } from "@/actions/plans";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { emptyPlan, PlanFields, planPayload, PlanForm, PLAN_STATUSES } from "@/app/components/_ui/plan/PlanFields";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

function unwrapPlan(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.name || record.id) return record;
  if (record.plan && typeof record.plan === "object") return record.plan as Record<string, unknown>;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  return null;
}

const PlanPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string; isp?: { id?: number } }[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyPlan);

  useEffect(() => {
    const load = async () => {
      const [planResponse, providerResponse, hotspotResponse] = await Promise.all([
        getPlan(id),
        getAllProviders(),
        getAllHotspots(),
      ]);
      setProviders(asList<IProvider>(providerResponse));
      setHotspots(asList(hotspotResponse));
      const plan = unwrapPlan(planResponse);
      if (!plan) {
        setMissing(true);
        return;
      }
      const isp = plan.isp && typeof plan.isp === "object" ? plan.isp as { id?: number } : null;
      const hotspot = plan.hotspot && typeof plan.hotspot === "object" ? plan.hotspot as { id?: number } : null;
      const status = String(plan.status || "ativo").toLowerCase();
      setForm({
        name: String(plan.name || ""),
        description: String(plan.description || ""),
        price: plan.price != null ? String(plan.price) : "",
        rate_limit: String(plan.rate_limit || ""),
        session_timeout: String(plan.session_timeout || ""),
        idle_timeout: String(plan.idle_timeout || ""),
        shared_users: String(plan.shared_users || "1"),
        validity_hours: plan.validity_hours != null ? String(plan.validity_hours) : "",
        ispID: String(plan.ispID ?? isp?.id ?? ""),
        hsID: String(plan.hsID ?? hotspot?.id ?? ""),
        mk_profile: String(plan.mk_profile || ""),
        sync_mikrotik: plan.sync_mikrotik !== false,
        status: PLAN_STATUSES.includes(status) ? status : "ativo",
      });
    };
    load();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await updatePlan(id, planPayload(form));
    if (response.status === 200) {
      router.push("/plans");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível salvar o plano."));
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deletePlan(id);
    if (response.status === 200) {
      router.push("/plans");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível excluir o plano."));
    setDeleting(false);
  };

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Plano não encontrado.</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Atualize limites, preço e o vínculo com hotspot para sync do perfil.</p>
          <PlanFields
            form={form}
            providers={providers}
            hotspots={hotspots}
            onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
          />
          {error ? <p className="error-message form-span">{error}</p> : null}
          {confirmDelete ? (
            <div className="confirm-reboot form-full">
              <p>Excluir este plano remove o cadastro usado na geração de vouchers.</p>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/plans")}>Voltar</button>
            {confirmDelete ? null : (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir plano</button>
            )}
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar plano"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default PlanPage;
