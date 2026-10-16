"use client";

import { getAllClientsConnected } from "@/actions/get-all-clients-connected";
import { asList, ResourceTable } from "@/app/components/_ui/resource/ResourceTable";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SessionRow = {
  id: string;
  clientId?: number;
  nome: string;
  email: string;
  ip: string;
  mac: string;
  hotspot: string;
  loginBy: string;
  uptime: string;
};

function flattenSessions(value: unknown): SessionRow[] {
  return asList<Record<string, any>>(value).flatMap((item, index) => {
    const user = item.user?.[0] ?? item;
    const server = item.server ?? item;
    const nome = user?.nome_completo || user?.name || user?.email;
    if (!nome && !server?.address) return [];
    const clientId = typeof user?.id === "number" ? user.id : undefined;
    return [{
      id: String(user?.id ?? server?.id ?? index),
      clientId,
      nome: nome || "Sessão",
      email: user?.email || "—",
      ip: server?.address || user?.ip_local || "—",
      mac: server?.mac_address || "—",
      hotspot: server?.hotspot?.nome || user?.hotspot?.nome || "—",
      loginBy: server?.login_by || "—",
      uptime: server?.uptime || "—",
    }];
  });
}

const ConnectedClientsPage = () => {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllClientsConnected();
      setSessions(flattenSessions(response));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sessions;
    return sessions.filter((session) =>
      [session.nome, session.email, session.ip, session.mac, session.hotspot, session.loginBy]
        .some((value) => value.toLowerCase().includes(term))
    );
  }, [sessions, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">
          {sessions.length} {sessions.length === 1 ? "sessão ativa" : "sessões ativas"} nos hotspots.
        </p>
        <input
          className="search-field"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar sessão"
          aria-label="Buscar sessão"
        />
      </div>

      <ResourceTable
        rows={visible}
        empty={sessions.length === 0 ? "Nenhum cliente conectado agora." : "Nenhuma sessão encontrada para essa busca."}
        rowKey={(row) => row.id}
        columns={[
          {
            key: "nome",
            header: "Cliente",
            render: (row) => (
              <>
                <span className="cell-title">{row.nome}</span>
                <span className="cell-sub">{row.email}</span>
              </>
            ),
          },
          { key: "hotspot", header: "Hotspot", render: (row) => row.hotspot },
          { key: "ip", header: "IP", render: (row) => row.ip },
          { key: "mac", header: "MAC", render: (row) => row.mac },
          { key: "login", header: "Entrada", render: (row) => row.loginBy },
          { key: "uptime", header: "Uptime", render: (row) => row.uptime },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              row.clientId ? (
                <div className="row-links">
                  <Link href={`/client/show/${row.clientId}`}>Abrir</Link>
                </div>
              ) : "—"
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default ConnectedClientsPage;
