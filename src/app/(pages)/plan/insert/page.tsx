"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllProviders } from "@/actions/get-all-provideres";
import { createPlan } from "@/actions/plans";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { emptyPlan, PlanFields, planPayload, PlanForm } from "@/app/components/_ui/plan/PlanFields";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível salvar o plano.";
}

const InsertPlanPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string; isp?: { id?: number } }[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyPlan);

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
    const response = await createPlan(planPayload(form));
    if (response.status === 201 || response.status === 200) {
      router.push("/plans");
      return;
    }
    setError(messageFrom(response.data));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Se houver hotspot e sync ativo, o perfil correspondente é criado/atualizado no MikroTik.</p>
          <PlanFields
            form={form}
            providers={providers}
            hotspots={hotspots}
            onChange={(key, value) => setForm((current) => ({ ...current, [key]: value }))}
          />
          {error ? <p className="error-message form-span">{error}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/plans")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar plano"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default InsertPlanPage;
