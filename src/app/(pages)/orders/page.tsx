"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllOrders, getPaymentReports } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { useAcl } from "@/app/hooks/use-acl";
import { ORDER_FILTER_STATUSES, paymentStatusLabel } from "@/app/lib/order-payment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OrderRow = {
  id?: number;
  order_number?: string;
  status?: string;
  payment_status?: string;
  payment_status_label?: string;
  value?: string | number;
  currency?: string;
  payment_method?: string;
  paid_at?: string;
  created_at?: string;
  plan?: { name?: string };
  gateway?: { name?: string; provider?: string; sandbox?: boolean };
  hotspot?: { nome?: string };
};

type ReportTotals = {
  orders?: number;
  paid?: number;
  pending?: number;
  revenue?: number;
  mikrotik_provisioned?: number;
  mikrotik_pending_or_failed?: number;
};

function money(value?: string | number, currency = "BRL") {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return value != null && value !== "" ? String(value) : "—";
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });
}

const OrdersPage = () => {
  const router = useRouter();
  const { can, permission, ready } = useAcl();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string }[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [hsID, setHsID] = useState("");
  const [totals, setTotals] = useState<ReportTotals | null>(null);

  useEffect(() => {
    if (!ready) return;
    const load = async () => {
      const filters = {
        status: status || undefined,
        hsID: hsID ? Number(hsID) : undefined,
      };
      const [orderResponse, hotspotResponse, reportResponse] = await Promise.all([
        getAllOrders(filters),
        getAllHotspots(),
        can("reports.read") ? getPaymentReports({ hsID: filters.hsID }) : Promise.resolve(null),
      ]);
      setOrders(asList<OrderRow>(orderResponse));
      setHotspots(asList(hotspotResponse));
      const report = reportResponse && typeof reportResponse === "object"
        ? (reportResponse as { totals?: ReportTotals }).totals ?? null
        : null;
      setTotals(report);
    };
    load();
  }, [status, hsID, ready, permission]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      [
        order.order_number,
        order.status,
        order.payment_status,
        order.payment_status_label,
        order.payment_method,
        order.plan?.name,
        order.gateway?.name,
        order.gateway?.provider,
        order.hotspot?.nome,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [orders, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Pedidos de pagamento de planos e emissão de vouchers.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar pedido"
            aria-label="Buscar pedido"
          />
          <button type="button" className="btn" onClick={() => router.push("/order/status")}>
            Consultar
          </button>
          <button type="button" className="btn btn--solid" onClick={() => router.push("/order/checkout")}>
            Novo checkout
          </button>
        </div>
      </div>

      {totals ? (
        <section className="stat-grid" style={{ marginBottom: 18 }}>
          <div className="stat-card">
            <span>Pedidos</span>
            <strong>{totals.orders ?? 0}</strong>
            <em>No filtro atual</em>
          </div>
          <div className="stat-card">
            <span>Pagos</span>
            <strong>{totals.paid ?? 0}</strong>
            <em>{money(totals.revenue)}</em>
          </div>
          <div className="stat-card">
            <span>Em aberto</span>
            <strong>{totals.pending ?? 0}</strong>
            <em>Aguardando pagamento</em>
          </div>
          <div className="stat-card">
            <span>Provisionamento</span>
            <strong>{totals.mikrotik_provisioned ?? 0}</strong>
            <em>{totals.mikrotik_pending_or_failed ?? 0} pendente/falha</em>
          </div>
        </section>
      ) : null}

      <div className="filter-bar">
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {ORDER_FILTER_STATUSES.map((item) => (
              <option key={item || "all"} value={item}>{item || "Todos"}</option>
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

      <ResourceTable
        rows={visible}
        empty={orders.length === 0 ? "Nenhum pedido cadastrado." : "Nenhum pedido encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? row.order_number ?? index}
        columns={[
          {
            key: "pedido",
            header: "Pedido",
            render: (row) => (
              <>
                <span className="cell-title">{row.order_number || `#${row.id}` || "—"}</span>
                <span className="cell-sub">{row.plan?.name || ""}</span>
              </>
            ),
          },
          {
            key: "valor",
            header: "Valor",
            render: (row) => money(row.value, row.currency),
          },
          {
            key: "gateway",
            header: "Gateway",
            render: (row) => row.gateway?.name || row.gateway?.provider || "—",
          },
          {
            key: "hotspot",
            header: "Hotspot",
            render: (row) => row.hotspot?.nome || "—",
          },
          {
            key: "status",
            header: "Status",
            render: (row) => (
              <>
                <StatusPill value={row.status} />
                <span className="cell-sub">
                  {paymentStatusLabel(row.payment_status, row.payment_status_label, row.status)}
                </span>
              </>
            ),
          },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/order/show/${row.id}`}>Abrir</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default OrdersPage;
