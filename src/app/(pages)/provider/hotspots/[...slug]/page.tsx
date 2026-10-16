"use client";

import { getAllHotspotsProvider } from "@/actions/get-all-hotspots-provider";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type HotspotRow = {
  id?: number;
  nome?: string;
  ip?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  isp?: { id?: number; nome?: string };
};

const ProviderHotspotsPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const providerId = React.use(params).slug[0];
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllHotspotsProvider(providerId);
      if (!response) {
        setError("Não foi possível carregar os hotspots deste provedor.");
        setHotspots([]);
        return;
      }
      setError("");
      setHotspots(asList<HotspotRow>(response));
    };
    load();
  }, [providerId]);

  const providerName = hotspots.find((hotspot) => hotspot.isp?.nome)?.isp?.nome;
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return hotspots;
    return hotspots.filter((hotspot) =>
      [hotspot.nome, hotspot.ip, hotspot.cidade, hotspot.estado, hotspot.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [hotspots, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">
          {providerName ? `Pontos de ${providerName}.` : "Pontos de acesso deste provedor."}
        </p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar hotspot"
            aria-label="Buscar hotspot"
          />
          <button type="button" className="btn" onClick={() => router.push("/providers")}>
            Voltar
          </button>
          <button type="button" className="btn btn--solid" onClick={() => router.push("/provider/hotspot/insert")}>
            Novo hotspot
          </button>
        </div>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <ResourceTable
        rows={visible}
        empty={hotspots.length === 0 ? "Nenhum hotspot cadastrado para este provedor." : "Nenhum hotspot encontrado para essa busca."}
        rowKey={(row, index) => row.id ?? index}
        columns={[
          {
            key: "nome",
            header: "Hotspot",
            render: (row) => (
              <>
                <span className="cell-title">{row.nome || "—"}</span>
                <span className="cell-sub">{row.ip || "Sem IP"}</span>
              </>
            ),
          },
          {
            key: "cidade",
            header: "Cidade",
            render: (row) => [row.cidade, row.estado].filter(Boolean).join(" · ") || "—",
          },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <Link href={`/provider/hotspot/show/${row.id}`}>Consultar</Link>
                <Link href={`/provider/hotspot/cadastro/${row.id}`}>Cadastro</Link>
                <Link href={`/provider/hotspot/edit/${row.id}`}>MikroTik</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default ProviderHotspotsPage;
