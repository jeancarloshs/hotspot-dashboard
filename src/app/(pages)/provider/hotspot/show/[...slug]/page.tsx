"use client";

import { getHotspot } from "@/actions/get-hotspot";
import { checkHotspotHealth } from "@/actions/hotspot-ops";
import { MikrotikTool, queryMikrotik } from "@/actions/query-mikrotik";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import { useAcl } from "@/app/hooks/use-acl";
import { messageFrom } from "@/app/lib/message";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type HotspotRecord = {
  id?: number;
  nome?: string;
  ip?: string;
  cidade?: string;
  estado?: string;
  endereco?: string;
  status?: string;
  mk_online?: boolean;
  mk_last_check?: string | null;
  mk_last_error?: string | null;
  mk_uptime?: string | null;
  mk_version?: string | null;
  mk_cpu_load?: string | null;
  mk_free_memory_mb?: number | null;
  isp?: { nome?: string };
};

const GROUPS: { label: string; tools: { id: MikrotikTool; label: string }[] }[] = [
  {
    label: "Equipamento",
    tools: [
      { id: "resource", label: "Recursos" },
      { id: "health", label: "Saúde" },
      { id: "logs", label: "Logs" },
    ],
  },
  {
    label: "Hotspot",
    tools: [
      { id: "users", label: "Usuários" },
      { id: "active", label: "Ativos" },
      { id: "profiles", label: "Perfis" },
      { id: "servers", label: "Servidores" },
      { id: "walledGarden", label: "Walled garden" },
    ],
  },
  {
    label: "Rede",
    tools: [
      { id: "interfaces", label: "Interfaces" },
      { id: "ethernet", label: "Ethernet" },
      { id: "bridges", label: "Bridges" },
      { id: "bridgePorts", label: "Bridge ports" },
      { id: "vlans", label: "VLANs" },
      { id: "routes", label: "Rotas" },
      { id: "addresses", label: "IP address" },
      { id: "pools", label: "IP pool" },
      { id: "leases", label: "DHCP leases" },
      { id: "networks", label: "DHCP networks" },
      { id: "dhcpServers", label: "DHCP servers" },
      { id: "queues", label: "Queues" },
      { id: "vpn", label: "L2TP / IPsec" },
    ],
  },
  {
    label: "Firewall",
    tools: [
      { id: "filter", label: "Filter" },
      { id: "nat", label: "NAT" },
      { id: "mangle", label: "Mangle" },
      { id: "raw", label: "Raw" },
    ],
  },
  {
    label: "Sistema",
    tools: [
      { id: "files", label: "Arquivos" },
    ],
  },
  {
    label: "Teste",
    tools: [
      { id: "ping", label: "Ping" },
      { id: "tracert", label: "Traceroute" },
    ],
  },
];

const HIDDEN_KEYS = new Set(["password", "secret", ".id"]);

function unwrapHotspot(value: unknown): HotspotRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.nome || record.ip || record.id) return record as HotspotRecord;
  if (record.hotspot && typeof record.hotspot === "object") return record.hotspot as HotspotRecord;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as HotspotRecord;
  }
  return null;
}

function asRows(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === "object") as Record<string, unknown>[];
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of ["data", "result", "users", "rows"]) {
      if (Array.isArray(record[key])) return asRows(record[key]);
    }
    return [record];
  }
  return [];
}

function labelFor(key: string) {
  return key.replace(/[-_]/g, " ");
}

function textFor(value: unknown) {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "sim" : "não";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function ResultView({ payload }: { payload: unknown }) {
  if (payload && typeof payload === "object" && !Array.isArray(payload) && typeof (payload as { message?: unknown }).message === "string") {
    const record = payload as Record<string, unknown>;
    if (Object.keys(record).length === 1) {
      return <p className="page-lead" style={{ padding: "16px 18px" }}>{String(record.message)}</p>;
    }
  }

  const rows = asRows(payload);
  if (rows.length === 0) {
    return <div className="empty-state">A consulta não retornou registros.</div>;
  }

  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))))
    .filter((key) => !HIDDEN_KEYS.has(key.toLowerCase()) && !key.toLowerCase().includes("password"));

  const scalars = rows.length === 1 && keys.every((key) => {
    const value = rows[0][key];
    return value == null || ["string", "number", "boolean"].includes(typeof value);
  });

  if (scalars) {
    return (
      <div className="fact-grid" style={{ padding: 18 }}>
        {keys.map((key) => (
          <div className="fact" key={key}>
            <span>{labelFor(key)}</span>
            <strong>{textFor(rows[0][key])}</strong>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="table-wrap mikrotik-result">
      <table className="data-table">
        <thead>
          <tr>
            {keys.map((key) => <th key={key}>{labelFor(key)}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={String(row[".id"] ?? row.id ?? index)}>
              {keys.map((key) => <td key={key}>{textFor(row[key])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const HotspotPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const resolvedParams = React.use(params);
  const { can } = useAcl();
  const id = resolvedParams.slug[0];
  const [hotspot, setHotspot] = useState<HotspotRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [tool, setTool] = useState<MikrotikTool>("resource");
  const [payload, setPayload] = useState<unknown>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState("1.1.1.1");
  const [count, setCount] = useState(5);
  const [confirmReboot, setConfirmReboot] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(false);

  const refreshHotspot = async () => {
    const response = await getHotspot(id);
    const record = unwrapHotspot(response);
    if (record) setHotspot(record);
    return record;
  };

  const run = async (next: MikrotikTool, address = hotspot?.ip || "") => {
    if (!address) return;
    setTool(next);
    setError("");
    setLoading(true);
    setConfirmReboot(false);
    const response = await queryMikrotik(next, address, { ip: target, count });
    setPayload(response.data ?? null);
    setError(response.error || "");
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const response = await getHotspot(id);
      if (cancelled) return;
      const record = unwrapHotspot(response);
      if (!record) {
        setMissing(true);
        return;
      }
      setHotspot(record);
      if (record.ip) {
        setLoading(true);
        const mikrotik = await queryMikrotik("resource", record.ip);
        if (cancelled) return;
        setPayload(mikrotik.data ?? null);
        setError(mikrotik.error || "");
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const needsTarget = tool === "ping" || tool === "tracert";

  const handleApiHealth = async () => {
    setCheckingHealth(true);
    setError("");
    const response = await checkHotspotHealth(id);
    if (response.status >= 200 && response.status < 300) {
      await refreshHotspot();
      setCheckingHealth(false);
      return;
    }
    setError(messageFrom(response.data, "Não foi possível atualizar o health."));
    setCheckingHealth(false);
  };

  return (
    <SideBar>
      {missing ? <div className="empty-state">Hotspot não encontrado.</div> : null}

      {hotspot ? (
        <>
          <section className="identity-grid">
            <div className="fact">
              <span>Nome</span>
              <strong>{hotspot.nome || "—"}</strong>
            </div>
            <div className="fact">
              <span>IP MikroTik</span>
              <strong>{hotspot.ip || "Sem IP"}</strong>
            </div>
            <div className="fact">
              <span>Provedor</span>
              <strong>{hotspot.isp?.nome || "—"}</strong>
            </div>
            <div className="fact">
              <span>Status</span>
              <strong><StatusPill value={hotspot.status} /></strong>
            </div>
            <div className="fact">
              <span>MikroTik</span>
              <strong>
                <StatusPill value={hotspot.mk_online === true ? "online" : hotspot.mk_online === false ? "offline" : "—"} />
              </strong>
            </div>
            <div className="fact">
              <span>Último check</span>
              <strong>
                {hotspot.mk_last_check
                  ? new Date(hotspot.mk_last_check).toLocaleString("pt-BR")
                  : "—"}
              </strong>
            </div>
            <div className="fact">
              <span>CPU / Memória</span>
              <strong>
                {[hotspot.mk_cpu_load, hotspot.mk_free_memory_mb != null ? `${hotspot.mk_free_memory_mb} MB` : null]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </strong>
            </div>
            <div className="fact">
              <span>Uptime / Versão</span>
              <strong>
                {[hotspot.mk_uptime, hotspot.mk_version].filter(Boolean).join(" · ") || "—"}
              </strong>
            </div>
          </section>

          {hotspot.mk_last_error ? (
            <p className="error-message">{hotspot.mk_last_error}</p>
          ) : null}

          <div className="page-toolbar">
            <p className="page-lead">As consultas leem o equipamento. A edição altera hotspot, rede, firewall e VPN neste MikroTik.</p>
            <div className="toolbar-actions">
              <button type="button" className="btn" disabled={checkingHealth} onClick={handleApiHealth}>
                {checkingHealth ? "Checando..." : "Atualizar health"}
              </button>
              {can("hotspots.write") ? (
                <Link className="btn" href={`/provider/hotspot/cadastro/${id}`}>Cadastro</Link>
              ) : null}
              {can("mikrotik.write") ? (
                <Link className="btn btn--solid" href={`/provider/hotspot/edit/${id}`}>Editar MikroTik</Link>
              ) : null}
            </div>
          </div>

          <section className="panel">
            <div className="tool-board">
              {GROUPS.map((group) => (
                <div className="tool-group" key={group.label}>
                  <p>{group.label}</p>
                  <div className="tool-group__items">
                    {group.tools.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={tool === item.id ? "tool-btn is-active" : "tool-btn"}
                        disabled={!hotspot.ip || loading}
                        onClick={() => {
                          if (item.id === "ping" || item.id === "tracert") {
                            setTool(item.id);
                            setError("");
                            setConfirmReboot(false);
                            return;
                          }
                          run(item.id);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {!hotspot.ip ? <p className="page-lead">Cadastre o IP do MikroTik para liberar o gerenciamento.</p> : null}

              {needsTarget ? (
                <form
                  className="diag-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    run(tool);
                  }}
                >
                  <label>
                    Destino
                    <input value={target} onChange={(event) => setTarget(event.target.value)} required />
                  </label>
                  {tool === "ping" ? (
                    <label>
                      Pacotes
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={count}
                        onChange={(event) => setCount(Number(event.target.value))}
                      />
                    </label>
                  ) : null}
                  <button type="submit" className="btn btn--solid" disabled={loading || !hotspot.ip}>
                    Executar
                  </button>
                </form>
              ) : null}

              <div className="confirm-reboot">
                <p>Reiniciar desliga o MikroTik até ele voltar. As sessões do hotspot caem.</p>
                {confirmReboot ? (
                  <div className="toolbar-actions">
                    <button type="button" className="btn" onClick={() => setConfirmReboot(false)}>Cancelar</button>
                    <button
                      type="button"
                      className="btn btn--solid"
                      disabled={loading || !hotspot.ip}
                      onClick={() => run("reboot")}
                    >
                      Confirmar reinício
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="tool-btn is-danger"
                    disabled={!hotspot.ip || loading}
                    onClick={() => setConfirmReboot(true)}
                  >
                    Reiniciar
                  </button>
                )}
              </div>
            </div>

            {loading ? <div className="empty-state">Consultando o MikroTik...</div> : null}
            {!loading && error ? <p className="error-message" style={{ padding: "0 18px 18px" }}>{error}</p> : null}
            {!loading && !error && payload != null ? <ResultView payload={payload} /> : null}
          </section>
        </>
      ) : null}
    </SideBar>
  );
};

export default HotspotPage;
