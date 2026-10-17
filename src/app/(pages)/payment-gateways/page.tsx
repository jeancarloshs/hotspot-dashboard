"use client";

import { getAllPaymentGateways } from "@/actions/payment-gateways";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type GatewayRow = {
  id?: number;
  name?: string;
  provider?: string;
  status?: string;
  sandbox?: boolean;
  webhook_path?: string;
  isp?: { nome?: string };
  hotspot?: { nome?: string };
};

const PaymentGatewaysPage = () => {
  const router = useRouter();
  const [rows, setRows] = useState<GatewayRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllPaymentGateways();
      setRows(asList<GatewayRow>(response));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      [row.name, row.provider, row.status, row.webhook_path, row.isp?.nome, row.hotspot?.nome]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [rows, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Credenciais e webhooks dos provedores de pagamento.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar gateway"
            aria-label="Buscar gateway"
          />
          <button type="button" className="btn" onClick={() => router.push("/orders")}>
            Pedidos
          </button>
          <button type="button" className="btn btn--solid" onClick={() => router.push("/payment-gateway/insert")}>
            Novo gateway
          </button>
        </div>
      </div>

      <ResourceTable
        rows={visible}
        empty={rows.length === 0 ? "Nenhum gateway cadastrado." : "Nenhum gateway encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "nome",
            header: "Gateway",
            render: (row) => (
              <>
                <span className="cell-title">{row.name || "—"}</span>
                <span className="cell-sub">{row.provider || ""}</span>
              </>
            ),
          },
          { key: "isp", header: "ISP", render: (row) => row.isp?.nome || "Global" },
          {
            key: "hotspot",
            header: "Hotspot",
            render: (row) => row.hotspot?.nome || (row.isp?.nome ? "ISP inteiro" : "Global"),
          },
          { key: "ambiente", header: "Ambiente", render: (row) => (row.sandbox ? "Sandbox" : "Produção") },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/payment-gateway/show/${row.id}`}>Abrir</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default PaymentGatewaysPage;
