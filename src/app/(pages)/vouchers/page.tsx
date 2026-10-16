"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllPlans } from "@/actions/plans";
import { deleteVoucher, getAllVouchers } from "@/actions/vouchers";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type VoucherRow = {
  id?: number;
  code?: string;
  password?: string;
  status?: string;
  expires_at?: string;
  planID?: number;
  hsID?: number;
  plan?: { name?: string };
  hotspot?: { nome?: string };
};

const STATUSES = ["", "ativo", "usado", "expirado", "cancelado", "inativo", "deletado"];

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível excluir o voucher.";
}

const VouchersPage = () => {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [plans, setPlans] = useState<{ id?: number; name?: string }[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string }[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [planID, setPlanID] = useState("");
  const [hsID, setHsID] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    const [voucherResponse, planResponse, hotspotResponse] = await Promise.all([
      getAllVouchers({
        status: status || undefined,
        planID: planID ? Number(planID) : undefined,
        hsID: hsID ? Number(hsID) : undefined,
      }),
      getAllPlans(),
      getAllHotspots(),
    ]);
    setVouchers(asList<VoucherRow>(voucherResponse));
    setPlans(asList(planResponse));
    setHotspots(asList(hotspotResponse));
  };

  useEffect(() => {
    load();
  }, [status, planID, hsID]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return vouchers;
    return vouchers.filter((voucher) =>
      [voucher.code, voucher.password, voucher.status, voucher.plan?.name, voucher.hotspot?.nome]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [vouchers, query]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    setDeletingId(id);
    setError("");
    const response = await deleteVoucher(String(id));
    if (response.status === 200) {
      await load();
      setDeletingId(null);
      return;
    }
    setError(messageFrom(response.data));
    setDeletingId(null);
  };

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Lotes de acesso vinculados a planos e hotspots.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar voucher"
            aria-label="Buscar voucher"
          />
          <button type="button" className="btn" onClick={() => router.push("/voucher/redeem")}>
            Resgatar
          </button>
          <button type="button" className="btn btn--solid" onClick={() => router.push("/voucher/generate")}>
            Gerar lote
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map((item) => (
              <option key={item || "all"} value={item}>{item || "Todos"}</option>
            ))}
          </select>
        </label>
        <label>
          Plano
          <select value={planID} onChange={(event) => setPlanID(event.target.value)}>
            <option value="">Todos</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>{plan.name}</option>
            ))}
          </select>
        </label>
        <label>
          Hotspot
          <select value={hsID} onChange={(event) => setHsID(event.target.value)}>
            <option value="">Todos</option>
            {hotspots.map((hotspot) => (
              <option key={hotspot.id} value={hotspot.id}>{hotspot.nome}</option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <ResourceTable
        rows={visible}
        empty={vouchers.length === 0 ? "Nenhum voucher encontrado." : "Nenhum voucher para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "codigo",
            header: "Código",
            render: (row) => (
              <>
                <span className="cell-title">{row.code || "—"}</span>
                <span className="cell-sub">{row.password || ""}</span>
              </>
            ),
          },
          { key: "plano", header: "Plano", render: (row) => row.plan?.name || row.planID || "—" },
          { key: "hotspot", header: "Hotspot", render: (row) => row.hotspot?.nome || row.hsID || "—" },
          { key: "expira", header: "Expira", render: (row) => row.expires_at ? new Date(row.expires_at).toLocaleString("pt-BR") : "—" },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/voucher/show/${row.id}`}>Abrir</Link>
                <button
                  type="button"
                  className="text-link"
                  style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
                  disabled={deletingId === row.id}
                  onClick={() => handleDelete(row.id)}
                >
                  {deletingId === row.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default VouchersPage;
