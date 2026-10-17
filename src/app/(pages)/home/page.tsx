"use client";

import { getAllClients } from "@/actions/get-all-clients";
import { getAllClientsConnected } from "@/actions/get-all-clients-connected";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllProviders } from "@/actions/get-all-provideres";
import { getPaymentReports } from "@/actions/orders";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { useAcl } from "@/app/hooks/use-acl";
import IProvider from "@/app/interface/IProviders";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type HotspotRow = {
  id?: number;
  nome?: string;
  ip?: string;
  cidade?: string;
  status?: string;
  mk_online?: boolean;
};

type SessionRow = {
  id: string;
  nome: string;
  email: string;
  ip: string;
  hotspot: string;
  hotspotId?: number;
  uptime: string;
};

type ReportTotals = {
  orders?: number;
  paid?: number;
  pending?: number;
  revenue?: number;
  mikrotik_provisioned?: number;
  mikrotik_pending_or_failed?: number;
};

function flattenSessions(value: unknown): SessionRow[] {
  return asList<Record<string, any>>(value).flatMap((item, index) => {
    const user = item.user?.[0] ?? item;
    const server = item.server ?? item;
    const nome = user?.nome_completo || user?.name || user?.email;
    if (!nome && !server?.address) return [];
    const hotspot = server?.hotspot ?? user?.hotspot;
    const hotspotId = typeof hotspot?.id === "number"
      ? hotspot.id
      : typeof server?.hsID === "number"
        ? server.hsID
        : typeof user?.hsID === "number"
          ? user.hsID
          : undefined;
    return [{
      id: String(user?.id ?? server?.id ?? index),
      nome: nome || "Sessão",
      email: user?.email || "—",
      ip: server?.address || user?.ip_local || "—",
      hotspot: hotspot?.nome || "—",
      hotspotId,
      uptime: server?.uptime || "—",
    }];
  });
}

function connectedCountFor(hotspot: HotspotRow, sessions: SessionRow[]) {
  return sessions.filter((session) => {
    if (hotspot.id != null && session.hotspotId != null) return session.hotspotId === hotspot.id;
    if (hotspot.nome && session.hotspot !== "—") {
      return session.hotspot.toLowerCase() === hotspot.nome.toLowerCase();
    }
    return false;
  }).length;
}

function money(value?: number) {
  if (value == null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const HomePage = () => {
  const { can, permission, ready } = useAcl();
  const [clients, setClients] = useState<unknown[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [totals, setTotals] = useState<ReportTotals | null>(null);

  useEffect(() => {
    if (!ready) return;
    const load = async () => {
      const canProviders = can("providers.read");
      const canReports = can("reports.read");
      const [connected, allClients, allProviders, allHotspots, reportResponse] = await Promise.all([
        getAllClientsConnected(),
        can("clients.read") ? getAllClients() : Promise.resolve(null),
        canProviders ? getAllProviders() : Promise.resolve(null),
        can("hotspots.read") ? getAllHotspots() : Promise.resolve(null),
        canReports ? getPaymentReports() : Promise.resolve(null),
      ]);
      setSessions(flattenSessions(connected));
      setClients(asList(allClients));
      setProviders(asList<IProvider>(allProviders));
      setHotspots(asList<HotspotRow>(allHotspots));
      const report = reportResponse && typeof reportResponse === "object"
        ? (reportResponse as { totals?: ReportTotals }).totals ?? null
        : null;
      setTotals(canReports ? report : null);
    };

    load();
  }, [ready, permission]);

  const hotspotRows = useMemo(
    () => hotspots.slice(0, 5).map((hotspot) => ({
      ...hotspot,
      connected: connectedCountFor(hotspot, sessions),
    })),
    [hotspots, sessions]
  );

  const showProviders = can("providers.read");
  const showReports = can("reports.read");

  return (
    <SideBar>
      <section className="stat-grid">
        {can("clients.read") ? (
          <Link className="stat-card" href="/clients">
            <span>Clientes</span>
            <strong>{clients.length}</strong>
            <em>Cadastros de acesso</em>
          </Link>
        ) : null}
        <Link className="stat-card" href="/clients/connected">
          <span>Conectados agora</span>
          <strong>{sessions.length}</strong>
          <em>Sessões ativas no hotspot</em>
        </Link>
        {showProviders ? (
          <Link className="stat-card" href="/providers">
            <span>Provedores</span>
            <strong>{providers.length}</strong>
            <em>Operadoras cadastradas</em>
          </Link>
        ) : null}
        {can("hotspots.read") ? (
          <Link className="stat-card" href="/hotspots">
            <span>Hotspots</span>
            <strong>{hotspots.length}</strong>
            <em>Pontos MikroTik</em>
          </Link>
        ) : null}
      </section>

      {showReports && totals ? (
        <section className="stat-grid" style={{ marginBottom: 18 }}>
          <Link className="stat-card" href="/orders">
            <span>Pedidos</span>
            <strong>{totals.orders ?? 0}</strong>
            <em>Resumo financeiro</em>
          </Link>
          <Link className="stat-card" href="/orders">
            <span>Pagos</span>
            <strong>{totals.paid ?? 0}</strong>
            <em>{money(totals.revenue)}</em>
          </Link>
          <Link className="stat-card" href="/orders">
            <span>Em aberto</span>
            <strong>{totals.pending ?? 0}</strong>
            <em>Aguardando pagamento</em>
          </Link>
          <Link className="stat-card" href="/orders">
            <span>Provisionamento</span>
            <strong>{totals.mikrotik_provisioned ?? 0}</strong>
            <em>{totals.mikrotik_pending_or_failed ?? 0} pendente/falha</em>
          </Link>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Sessões ativas</h2>
            <span>Clientes conectados neste momento</span>
          </div>
          <Link className="text-link" href="/clients/connected">Ver sessões</Link>
        </div>
        <ResourceTable
          bare
          rows={sessions}
          empty="Nenhum cliente conectado agora."
          rowKey={(row) => row.id}
          columns={[
            { key: "nome", header: "Cliente", render: (row) => (<><span className="cell-title">{row.nome}</span><span className="cell-sub">{row.email}</span></>) },
            { key: "hotspot", header: "Hotspot", render: (row) => row.hotspot },
            { key: "ip", header: "IP", render: (row) => row.ip },
            { key: "uptime", header: "Uptime", render: (row) => row.uptime, align: "right" },
          ]}
        />
      </section>

      <div className="home-grid">
        {showProviders ? (
          <section className="panel">
            <div className="panel-head">
              <h2>Provedores</h2>
              <Link className="text-link" href="/providers">Abrir lista</Link>
            </div>
            <ResourceTable
              bare
              rows={providers.slice(0, 5)}
              empty="Nenhum provedor cadastrado."
              rowKey={(row, index) => row.id ?? index}
              columns={[
                { key: "nome", header: "Nome", render: (row) => row.nome || "—" },
                { key: "cidade", header: "Cidade", render: (row) => row.cidade || "—" },
                { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} />, align: "right" },
              ]}
            />
          </section>
        ) : null}
        {can("hotspots.read") ? (
          <section className="panel">
            <div className="panel-head">
              <h2>Hotspots</h2>
              <Link className="text-link" href="/hotspots">Abrir lista</Link>
            </div>
            <ResourceTable
              bare
              rows={hotspotRows}
              empty="Nenhum hotspot cadastrado."
              rowKey={(row, index) => row.id ?? index}
              columns={[
                { key: "nome", header: "Nome", render: (row) => (<><span className="cell-title">{row.nome || "—"}</span><span className="cell-sub">{row.ip || row.cidade || ""}</span></>) },
                { key: "connected", header: "Conectados", render: (row) => row.connected, align: "right" },
                {
                  key: "mk",
                  header: "MK",
                  render: (row) => (
                    <StatusPill
                      value={row.mk_online === true ? "online" : row.mk_online === false ? "offline" : "—"}
                    />
                  ),
                },
                { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} />, align: "right" },
              ]}
            />
          </section>
        ) : null}
      </div>
    </SideBar>
  );
};

export default HomePage;
