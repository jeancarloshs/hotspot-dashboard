"use client";

import { getDevice } from "@/actions/devices";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { useApiFeedback } from "@/app/hooks/use-api-feedback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type DeviceRecord = {
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
  updated_at?: string;
};

function unwrap(value: unknown): DeviceRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.id != null || record.device_type || record.user_agent) return record as DeviceRecord;
  if (record.device && typeof record.device === "object") return record.device as DeviceRecord;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as DeviceRecord;
  }
  return null;
}

const DeviceShowPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const { error, fromResponse, clearError } = useApiFeedback();
  const [device, setDevice] = useState<DeviceRecord | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      clearError();
      const response = await getDevice(id);
      if (cancelled) return;
      if (response.status === 404) {
        setMissing(true);
        return;
      }
      if (response.status < 200 || response.status >= 300) {
        fromResponse(response.status, response.data, "Não foi possível carregar o dispositivo.");
        setMissing(true);
        return;
      }
      const record = unwrap(response.data);
      if (!record) {
        setMissing(true);
        return;
      }
      setDevice(record);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, clearError, fromResponse]);

  if (missing && !device) {
    return (
      <SideBar>
        {error ? <p className="error-message">{error}</p> : null}
        <div className="empty-state">Dispositivo não encontrado.</div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={() => router.push("/devices")}>Voltar</button>
        </div>
      </SideBar>
    );
  }

  if (!device) {
    return (
      <SideBar>
        <div className="empty-state">Carregando dispositivo...</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="identity-grid">
        <div className="fact">
          <span>Tipo</span>
          <strong>{device.device_type || "—"}</strong>
        </div>
        <div className="fact">
          <span>Sistema</span>
          <strong>{[device.os, device.os_version].filter(Boolean).join(" ") || "—"}</strong>
        </div>
        <div className="fact">
          <span>Navegador</span>
          <strong>{[device.browser, device.browser_version].filter(Boolean).join(" ") || "—"}</strong>
        </div>
        <div className="fact">
          <span>Tela</span>
          <strong>
            {device.screen_width && device.screen_height
              ? `${device.screen_width}×${device.screen_height}`
              : "—"}
          </strong>
        </div>
        <div className="fact">
          <span>Criado</span>
          <strong>{device.created_at ? new Date(device.created_at).toLocaleString("pt-BR") : "—"}</strong>
        </div>
        <div className="fact">
          <span>Atualizado</span>
          <strong>{device.updated_at ? new Date(device.updated_at).toLocaleString("pt-BR") : "—"}</strong>
        </div>
      </section>

      <section className="panel" style={{ padding: 18 }}>
        <p className="page-lead" style={{ marginBottom: 8 }}>User agent</p>
        <p style={{ margin: 0, wordBreak: "break-word" }}>{device.user_agent || "—"}</p>
      </section>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <button type="button" className="btn" onClick={() => router.push("/devices")}>Voltar</button>
        <Link className="btn" href="/devices">Lista</Link>
      </div>
    </SideBar>
  );
};

export default DeviceShowPage;
