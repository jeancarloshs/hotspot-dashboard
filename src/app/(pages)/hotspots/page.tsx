"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { checkHotspotHealth } from "@/actions/hotspot-ops";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable, StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { messageFrom } from "@/app/lib/message";
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
  mk_online?: boolean;
  mk_last_check?: string | null;
  mk_last_error?: string | null;
  mk_cpu_load?: string | null;
  isp?: { id?: number; nome?: string };
};

function onlineLabel(row: HotspotRow) {
  if (row.mk_online === true) return "online";
  if (row.mk_online === false) return "offline";
  return "—";
}

const HotspotsPage = () => {
  const router = useRouter();
  const [hotspots, setHotspots] = useState<HotspotRow[]>([]);
  const [query, setQuery] = useState("");
  const [checkingId, setCheckingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    const response = await getAllHotspots();
    setHotspots(asList<HotspotRow>(response));
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return hotspots;
    return hotspots.filter((hotspot) =>
      [hotspot.nome, hotspot.ip, hotspot.cidade, hotspot.estado, hotspot.isp?.nome, hotspot.status, onlineLabel(hotspot)]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [hotspots, query]);

  const handleHealth = async (id?: number) => {
    if (!id) return;
    setCheckingId(id);
    setError("");
    const response = await checkHotspotHealth(id);
    if (response.status >= 200 && response.status < 300) {
      await load();
      setCheckingId(null);
      return;
    }
    setError(messageFrom(response.data, "Não foi possível verificar o hotspot."));
    setCheckingId(null);
  };

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Cada hotspot guarda o IP e o status de conexão com o MikroTik.</p>
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

      {error ? <p className="error-message">{error}</p> : null}

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
          {
            key: "mk",
            header: "MikroTik",
            render: (row) => (
              <>
                <StatusPill value={onlineLabel(row)} />
                <span className="cell-sub">
                  {row.mk_last_check
                    ? new Date(row.mk_last_check).toLocaleString("pt-BR")
                    : row.mk_last_error || "Sem check"}
                </span>
              </>
            ),
          },
          { key: "status", header: "Status", render: (row) => <StatusPill value={row.status} /> },
          {
            key: "acoes",
            header: "Ações",
            align: "right",
            render: (row) => (
              <div className="row-links">
                <button
                  type="button"
                  className="text-link"
                  style={{ background: "none", border: 0, padding: 0, cursor: "pointer" }}
                  disabled={checkingId === row.id}
                  onClick={() => handleHealth(row.id)}
                >
                  {checkingId === row.id ? "Checando..." : "Health"}
                </button>
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
