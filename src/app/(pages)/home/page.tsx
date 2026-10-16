"use client";

import { getAllClients } from "@/actions/get-all-clients";
import { getAllClientsConnected } from "@/actions/get-all-clients-connected";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllProviders } from "@/actions/get-all-provideres";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import IProvider from "@/app/interface/IProviders";
import Link from "next/link";
import { useEffect, useState } from "react";

type HotspotRow = {
  id?: number;
  nome?: string;
  ip?: string;
  cidade?: string;
  status?: string;
};

type SessionRow = {
  id: string;
  nome: string;
  email: string;
  ip: string;
  hotspot: string;
  uptime: string;
};

function flattenSessions(value: unknown): SessionRow[] {
  return asList<Record<string, any>>(value).flatMap((item, index) => {
    const user = item.user?.[0] ?? item;
    const server = item.server ?? item;
    const nome = user?.nome_completo || user?.name || user?.email;
    if (!nome && !server?.address) return [];
    return [{
      id: String(user?.id ?? server?.id ?? index),
      nome: nome || "Sessão",
      email: user?.email || "—",
      ip: server?.address || user?.ip_local || "—",
      hotspot: server?.hotspot?.nome || user?.hotspot?.nome || "—",
      uptime: server?.uptime || "—",
    }];
  });
}

const HomePage = () => {
  const [clients, setClients] = useState<unknown[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const [connected, allClients, allProviders, allHotspots] = await Promise.all([
        getAllClientsConnected(),
        getAllClients(),
        getAllProviders(),
        getAllHotspots(),
      ]);
      setSessions(flattenSessions(connected));
      setClients(asList(allClients));
      setProviders(asList<IProvider>(allProviders));
      setHotspots(asList<HotspotRow>(allHotspots));
    };

    load();
  }, []);

  return (
    <SideBar>
      <section className="stat-grid">
        <Link className="stat-card" href="/clients">
          <span>Clientes</span>
          <strong>{clients.length}</strong>
          <em>Cadastros de acesso</em>
        </Link>
        <Link className="stat-card" href="/clients/connected">
          <span>Conectados agora</span>
          <strong>{sessions.length}</strong>
          <em>Sessões ativas no hotspot</em>
        </Link>
        <Link className="stat-card" href="/providers">
          <span>Provedores</span>
          <strong>{providers.length}</strong>
          <em>Operadoras cadastradas</em>
        </Link>
        <Link className="stat-card" href="/hotspots">
          <span>Hotspots</span>
          <strong>{hotspots.length}</strong>
          <em>Pontos MikroTik</em>
        </Link>
      </section>

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
        <section className="panel">
          <div className="panel-head">
            <h2>Hotspots</h2>
            <Link className="text-link" href="/hotspots">Abrir lista</Link>
          </div>
          <ResourceTable
            bare
            rows={hotspots.slice(0, 5)}
            empty="Nenhum hotspot cadastrado."
            rowKey={(row, index) => row.id ?? index}
            columns={[
              { key: "nome", header: "Nome", render: (row) => (<><span className="cell-title">{row.nome || "—"}</span><span className="cell-sub">{row.ip || row.cidade || ""}</span></>) },
              { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} />, align: "right" },
            ]}
          />
        </section>
      </div>
    </SideBar>
  );
};

export default HomePage;
