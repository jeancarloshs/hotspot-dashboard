"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllPlans } from "@/actions/plans";
import { deleteVoucher, exportVoucherBatch, getAllVouchers, VoucherBatchExport } from "@/actions/vouchers";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { RowActionsMenu } from "@/app/components/_ui/resource/RowActionsMenu";
import { useAcl } from "@/app/hooks/use-acl";
import { useApiFeedback } from "@/app/hooks/use-api-feedback";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type VoucherRow = {
  id?: number;
  code?: string;
  password?: string;
  status?: string;
  expires_at?: string;
  batch?: string | null;
  planID?: number;
  hsID?: number;
  plan?: { name?: string };
  hotspot?: { nome?: string };
};

const STATUSES = ["", "ativo", "usado", "expirado", "cancelado", "inativo", "deletado"];

function downloadCsv(payload: VoucherBatchExport) {
  const blob = new Blob([payload.csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = payload.filename || `vouchers-${payload.batch}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

const VouchersPage = () => {
  const router = useRouter();
  const { can } = useAcl();
  const { error, fromResponse, clearError } = useApiFeedback();
  const [vouchers, setVouchers] = useState<VoucherRow[]>([]);
  const [plans, setPlans] = useState<{ id?: number; name?: string }[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string }[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [planID, setPlanID] = useState("");
  const [hsID, setHsID] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [exportingBatch, setExportingBatch] = useState<string | null>(null);

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
      [voucher.code, voucher.password, voucher.status, voucher.batch, voucher.plan?.name, voucher.hotspot?.nome]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [vouchers, query]);

  const batches = useMemo(() => {
    const values = new Set<string>();
    for (const voucher of vouchers) {
      if (voucher.batch) values.add(voucher.batch);
    }
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [vouchers]);

  const handleDelete = async (id?: number) => {
    if (!id) return;
    setDeletingId(id);
    clearError();
    const response = await deleteVoucher(String(id));
    if (response.status === 200) {
      await load();
      setDeletingId(null);
      return;
    }
    fromResponse(response.status, response.data, "Não foi possível excluir o voucher.");
    setDeletingId(null);
  };

  const handleExport = async (batch: string) => {
    setExportingBatch(batch);
    clearError();
    const response = await exportVoucherBatch(batch);
    if (response.status >= 200 && response.status < 300 && response.data && typeof response.data === "object") {
      const payload = response.data as VoucherBatchExport;
      if (payload.csv) {
        downloadCsv(payload);
        setExportingBatch(null);
        return;
      }
    }
    fromResponse(response.status, response.data, "Não foi possível exportar o lote.");
    setExportingBatch(null);
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
          {can("vouchers.write") ? (
            <button type="button" className="btn btn--solid" onClick={() => router.push("/voucher/generate")}>
              Gerar lote
            </button>
          ) : null}
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
        {can("vouchers.export") && batches.length > 0 ? (
          <label>
            Exportar lote
            <select
              value=""
              disabled={Boolean(exportingBatch)}
              onChange={(event) => {
                if (event.target.value) handleExport(event.target.value);
              }}
            >
              <option value="">{exportingBatch ? "Exportando..." : "Escolher lote"}</option>
              {batches.map((batch) => (
                <option key={batch} value={batch}>{batch}</option>
              ))}
            </select>
          </label>
        ) : null}
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
          { key: "lote", header: "Lote", render: (row) => row.batch || "—" },
          { key: "expira", header: "Expira", render: (row) => row.expires_at ? new Date(row.expires_at).toLocaleString("pt-BR") : "—" },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => {
              const exporting = exportingBatch === row.batch;
              const deleting = deletingId === row.id;
              return (
                <RowActionsMenu
                  items={[
                    {
                      key: "csv",
                      label: exporting ? "CSV..." : "CSV",
                      onClick: () => handleExport(row.batch!),
                      disabled: exporting,
                      hidden: !can("vouchers.export") || !row.batch,
                    },
                    {
                      key: "abrir",
                      label: "Abrir",
                      href: `/voucher/show/${row.id}`,
                    },
                    {
                      key: "excluir",
                      label: deleting ? "Excluindo..." : "Excluir",
                      onClick: () => handleDelete(row.id),
                      disabled: deleting,
                      hidden: !can("vouchers.write"),
                    },
                  ]}
                />
              );
            },
          },
        ]}
      />
    </SideBar>
  );
};

export default VouchersPage;
