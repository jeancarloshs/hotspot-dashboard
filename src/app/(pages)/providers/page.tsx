"use client";

import { getAllProviders } from "@/actions/get-all-provideres";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { RowActionsMenu } from "@/app/components/_ui/resource/RowActionsMenu";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const ProvidersPage = () => {
  const router = useRouter();
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllProviders();
      setProviders(asList<IProvider>(response));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return providers;
    return providers.filter((provider) =>
      [provider.nome, provider.razao_social, provider.cnpj, provider.cidade, provider.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [providers, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Consulte, edite e abra os hotspots de cada provedor.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar provedor"
            aria-label="Buscar provedor"
          />
          <button type="button" className="btn btn--solid" onClick={() => router.push("/provider/insert")}>
            Novo provedor
          </button>
        </div>
      </div>

      <ResourceTable
        rows={visible}
        empty={providers.length === 0 ? "Nenhum provedor cadastrado." : "Nenhum provedor encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "nome",
            header: "Provedor",
            render: (row) => (
              <>
                <span className="cell-title">{row.nome || "—"}</span>
                <span className="cell-sub">{row.razao_social || row.email || ""}</span>
              </>
            ),
          },
          { key: "cnpj", header: "CNPJ", render: (row) => row.cnpj || "—" },
          { key: "cidade", header: "Cidade", render: (row) => [row.cidade, row.estado].filter(Boolean).join(" · ") || "—" },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <RowActionsMenu
                items={[
                  { key: "hotspots", label: "Hotspots", href: `/provider/hotspots/${row.id}` },
                  { key: "editar", label: "Editar", href: `/provider/show/${row.id}` },
                ]}
              />
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default ProvidersPage;
