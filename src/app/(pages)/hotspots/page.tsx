"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type HotspotRow = {
  id?: number;
  nome?: string;
  ip?: string;
  cidade?: string;
  estado?: string;
  status?: string;
  isp?: { id?: number; nome?: string };
};

const HotspotsPage = () => {
  const router = useRouter();
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllHotspots();
      setHotspots(asList<HotspotRow>(response));
    };
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return hotspots;
    return hotspots.filter((hotspot) =>
      [hotspot.nome, hotspot.ip, hotspot.cidade, hotspot.estado, hotspot.isp?.nome, hotspot.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [hotspots, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Cada hotspot guarda o IP usado nas consultas MikroTik.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar hotspot"
            aria-label="Buscar hotspot"
          />
          <button type="button" className="btn btn--solid" onClick={() => router.push("/provider/hotspot/insert")}>
            Novo hotspot
          </button>
        </div>
      </div>

      <ResourceTable
        rows={visible}
        empty={hotspots.length === 0 ? "Nenhum hotspot cadastrado." : "Nenhum hotspot encontrado para essa busca."}
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
          { key: "provedor", header: "Provedor", render: (row) => row.isp?.nome || "—" },
          { key: "cidade", header: "Cidade", render: (row) => [row.cidade, row.estado].filter(Boolean).join(" · ") || "—" },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                {row.isp?.id ? <Link href={`/provider/hotspots/${row.isp.id}`}>Do provedor</Link> : null}
                <Link href={`/provider/hotspot/cadastro/${row.id}`}>Cadastro</Link>
                <Link href={`/provider/hotspot/show/${row.id}`}>Abrir</Link>
              </div>
            ),
          },
        ]}
      />
    </SideBar>
  );
};

export default HotspotsPage;
