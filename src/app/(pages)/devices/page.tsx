"use client";

import { getAllDevices, getConnectionLogs } from "@/actions/devices";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList, ResourceTable } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DeviceRow = {
  id?: number;
  device_type?: string;
  os?: string;
  os_version?: string;
  browser?: string;
  browser_version?: string;
  user_agent?: string;
  screen_width?: number;
  screen_height?: number;
  created_at?: string;
};

type LogRow = {
  id?: number;
  mac_address?: string;
  ip_address?: string;
  created_at?: string;
  userID?: number;
  deviceID?: number;
  hsID?: number;
  hotspot?: { nome?: string };
  user_ID?: { nome_completo?: string; email?: string };
  device?: { device_type?: string; os?: string; browser?: string };
};

const DevicesPage = () => {
  const router = useRouter();
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"devices" | "logs">("devices");

  useEffect(() => {
    const load = async () => {
      const [deviceResponse, logResponse] = await Promise.all([
        getAllDevices(100),
        getConnectionLogs({ limit: 100 }),
      ]);
      setDevices(asList<DeviceRow>(deviceResponse));
      setLogs(asList<LogRow>(logResponse));
    };
    load();
  }, []);

  const visibleDevices = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return devices;
    return devices.filter((device) =>
      [device.device_type, device.os, device.browser, device.user_agent]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [devices, query]);

  const visibleLogs = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((log) =>
      [
        log.mac_address,
        log.ip_address,
        log.hotspot?.nome,
        log.user_ID?.nome_completo,
        log.user_ID?.email,
        log.device?.device_type,
        log.device?.os,
        log.device?.browser,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [logs, query]);

  return (
    <SideBar>
      <div className="page-toolbar">
        <p className="page-lead">Dispositivos registrados e logs de conexão nos hotspots.</p>
        <div className="toolbar-actions">
          <input
            className="search-field"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={tab === "devices" ? "Buscar dispositivo" : "Buscar log"}
            aria-label="Buscar"
          />
          <button
            type="button"
            className={tab === "devices" ? "btn btn--solid" : "btn"}
            onClick={() => setTab("devices")}
          >
            Dispositivos
          </button>
          <button
            type="button"
            className={tab === "logs" ? "btn btn--solid" : "btn"}
            onClick={() => setTab("logs")}
          >
            Conexões
          </button>
          <button type="button" className="btn" onClick={() => router.push("/device/insert")}>
            Registrar
          </button>
        </div>
      </div>

      {tab === "devices" ? (
        <ResourceTable
          rows={visibleDevices}
          empty={devices.length === 0 ? "Nenhum dispositivo cadastrado." : "Nenhum dispositivo para essa busca."}
          rowKey={(row, index) => row.id ?? index}
          columns={[
            {
              key: "tipo",
              header: "Dispositivo",
              render: (row) => (
                <>
                  <span className="cell-title">{row.device_type || "—"}</span>
                  <span className="cell-sub">{[row.os, row.os_version].filter(Boolean).join(" ") || row.user_agent || ""}</span>
                </>
              ),
            },
            {
              key: "browser",
              header: "Navegador",
              render: (row) => [row.browser, row.browser_version].filter(Boolean).join(" ") || "—",
            },
            {
              key: "tela",
              header: "Tela",
              render: (row) =>
                row.screen_width && row.screen_height
                  ? `${row.screen_width}×${row.screen_height}`
                  : "—",
            },
            {
              key: "criado",
              header: "Criado",
              render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : "—"),
              align: "right",
            },
          ]}
        />
      ) : (
        <ResourceTable
          rows={visibleLogs}
          empty={logs.length === 0 ? "Nenhum log de conexão." : "Nenhum log para essa busca."}
          rowKey={(row, index) => row.id ?? index}
          columns={[
            {
              key: "cliente",
              header: "Cliente",
              render: (row) => (
                <>
                  <span className="cell-title">{row.user_ID?.nome_completo || `Usuário #${row.userID || "—"}`}</span>
                  <span className="cell-sub">{row.user_ID?.email || ""}</span>
                </>
              ),
            },
            { key: "hotspot", header: "Hotspot", render: (row) => row.hotspot?.nome || row.hsID || "—" },
            {
              key: "device",
              header: "Dispositivo",
              render: (row) =>
                [row.device?.device_type, row.device?.os, row.device?.browser].filter(Boolean).join(" · ")
                || row.deviceID
                || "—",
            },
            { key: "mac", header: "MAC", render: (row) => row.mac_address || "—" },
            { key: "ip", header: "IP", render: (row) => row.ip_address || "—" },
            {
              key: "quando",
              header: "Quando",
              render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString("pt-BR") : "—"),
              align: "right",
            },
          ]}
        />
      )}

      <p className="page-lead" style={{ marginTop: 16 }}>
        <Link className="text-link" href="/device/insert">Registrar novo dispositivo</Link>
      </p>
    </SideBar>
  );
};

export default DevicesPage;
