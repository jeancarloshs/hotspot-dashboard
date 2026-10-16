"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllOrders } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type OrderRow = {
  id?: number;
  order_number?: string;
  status?: string;
  value?: string | number;
  currency?: string;
  payment_method?: string;
  paid_at?: string;
  created_at?: string;
  plan?: { name?: string };
  gateway?: { name?: string; provider?: string; sandbox?: boolean };
  hotspot?: { nome?: string };
};

const STATUSES = ["", "pending", "paid", "approved", "cancelled", "failed", "refunded", "pendente", "pago", "cancelado"];

function money(value?: string | number, currency = "BRL") {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return value != null && value !== "" ? String(value) : "—";
  return amount.toLocaleString("pt-BR", { style: "currency", currency: currency || "BRL" });
}

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string }[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [hsID, setHsID] = useState("");

  useEffect(() => {
    const load = async () => {
      const [orderResponse, hotspotResponse] = await Promise.all([
        getAllOrders({
          status: status || undefined,
          hsID: hsID ? Number(hsID) : undefined,
        }),
        getAllHotspots(),
      ]);
      setOrders(asList<OrderRow>(orderResponse));
      setHotspots(asList(hotspotResponse));
    };
    load();
  }, [status, hsID]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) =>
      [
        order.order_number,
        order.status,
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
            render: (row) => <StatusPill value={row.status} />,
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
