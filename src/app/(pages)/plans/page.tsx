"use client";

import { getAllPlans } from "@/actions/plans";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type PlanRow = {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  rate_limit?: string;
  session_timeout?: string;
  validity_hours?: number;
  status?: string;
  mk_profile?: string;
  isp?: { nome?: string };
  hotspot?: { nome?: string };
};

const PlansPage = () => {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllPlans();
      setPlans(asList<PlanRow>(response));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return plans;
    return plans.filter((plan) =>
      [plan.name, plan.description, plan.rate_limit, plan.mk_profile, plan.status, plan.isp?.nome, plan.hotspot?.nome]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [plans, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Planos usados na geração de vouchers e no perfil do MikroTik.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar plano"
            aria-label="Buscar plano"
          />
          <button type="button" className="btn btn--solid" onClick={() => router.push("/plan/insert")}>
            Novo plano
          </button>
        </div>
      </div>

      <ResourceTable
        rows={visible}
        empty={plans.length === 0 ? "Nenhum plano cadastrado." : "Nenhum plano encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "nome",
            header: "Plano",
            render: (row) => (
              <>
                <span className="cell-title">{row.name || "—"}</span>
                <span className="cell-sub">{row.description || row.mk_profile || ""}</span>
              </>
            ),
          },
          {
            key: "preco",
            header: "Preço",
            render: (row) => (typeof row.price === "number" ? row.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—"),
          },
          { key: "banda", header: "Banda", render: (row) => row.rate_limit || "—" },
          { key: "sessao", header: "Sessão", render: (row) => row.session_timeout || "—" },
          { key: "validade", header: "Validade", render: (row) => (row.validity_hours != null ? `${row.validity_hours}h` : "—") },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/plan/show/${row.id}`}>Abrir</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default PlansPage;
