"use client";

import { getAllClients } from "@/actions/get-all-clients";
import { getAllClientsConnected } from "@/actions/get-all-clients-connected";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { IUsersConnected } from "@/app/interface/IUsersConnected";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function connectedIds(value: unknown) {
  const ids = new Set<number>();
  for (const item of asList<Record<string, any>>(value)) {
    const user = item.user?.[0] ?? item;
    if (typeof user?.id === "number") ids.add(user.id);
  }
  return ids;
}

const ClientsPage = () => {
  const router = useRouter();
  const [clients, setClients] = useState<IUsersConnected[]>([]);
  const [online, setOnline] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const [allClients, connected] = await Promise.all([
        getAllClients(),
        getAllClientsConnected(),
      ]);
      setClients(asList<IUsersConnected>(allClients));
      setOnline(connectedIds(connected));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return clients;
    return clients.filter((client) =>
      [client.nome_completo, client.email, client.cpf, client.telefone, client.cidade, client.tipo_usuario]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [clients, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">
          {online.size} {online.size === 1 ? "cliente conectado" : "clientes conectados"} de {clients.length} cadastrados.
        </p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente"
            aria-label="Buscar cliente"
          />
          <button type="button" className="btn btn--solid" onClick={() => router.push("/client/insert")}>
            Novo cliente
          </button>
        </div>
      </div>
      <div className="page-links">
        <Link className="text-link" href="/clients/connected">Sessões conectadas</Link>
        <Link className="text-link" href="/client/login">Login do cliente</Link>
        <Link className="text-link" href="/device/insert">Registrar dispositivo</Link>
      </div>

      <ResourceTable
        rows={visible}
        empty={clients.length === 0 ? "Nenhum cliente cadastrado." : "Nenhum cliente encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "nome",
            header: "Cliente",
            render: (row) => (
              <>
                <span className="cell-title">{row.nome_completo || "—"}</span>
                <span className="cell-sub">{row.email || ""}</span>
              </>
            ),
          },
          { key: "telefone", header: "Telefone", render: (row) => row.telefone || "—" },
          { key: "cidade", header: "Cidade", render: (row) => [row.cidade, row.estado].filter(Boolean).join(" · ") || "—" },
          { key: "tipo", header: "Tipo", render: (row) => row.tipo_usuario || "—" },
          {
            key: "sessao",
            header: "Sessão",
            render: (row) => <StatusPill value={online.has(row.id) ? "online" : "offline"} />,
          },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/client/show/${row.id}`}>Abrir</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default ClientsPage;
