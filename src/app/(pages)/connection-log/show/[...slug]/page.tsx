"use client";

import { getConnectionLog } from "@/actions/devices";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { useApiFeedback } from "@/app/hooks/use-api-feedback";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type LogRecord = {
  id?: number;
  mac_address?: string;
  ip_address?: string;
  created_at?: string;
  updated_at?: string;
  userID?: number;
  deviceID?: number;
  hsID?: number;
  hotspot?: { id?: number; nome?: string; ip?: string };
  user_ID?: { id?: number; nome_completo?: string; email?: string; cpf?: string };
  device?: {
    id?: number;
    device_type?: string;
    os?: string;
    browser?: string;
    user_agent?: string;
  };
};

function unwrap(value: unknown): LogRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.id != null || record.mac_address || record.deviceID) return record as LogRecord;
  if (record.log && typeof record.log === "object") return record.log as LogRecord;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as LogRecord;
  }
  return null;
}

const ConnectionLogShowPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const { error, fromResponse, clearError } = useApiFeedback();
  const [log, setLog] = useState<LogRecord | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      clearError();
      const response = await getConnectionLog(id);
      if (cancelled) return;
      if (response.status === 404) {
        setMissing(true);
        return;
      }
      if (response.status < 200 || response.status >= 300) {
        fromResponse(response.status, response.data, "Não foi possível carregar o log de conexão.");
        setMissing(true);
        return;
      }
      const record = unwrap(response.data);
      if (!record) {
        setMissing(true);
        return;
      }
      setLog(record);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, clearError, fromResponse]);

  if (missing && !log) {
    return (
      <SideBar>
        {error ? <p className="error-message">{error}</p> : null}
        <div className="empty-state">Log de conexão não encontrado.</div>
        <div className="form-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={() => router.push("/devices")}>Voltar</button>
        </div>
      </SideBar>
    );
  }

  if (!log) {
    return (
      <SideBar>
        <div className="empty-state">Carregando log...</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="identity-grid">
        <div className="fact">
          <span>Cliente</span>
          <strong>{log.user_ID?.nome_completo || (log.userID != null ? `#${log.userID}` : "—")}</strong>
        </div>
        <div className="fact">
          <span>E-mail</span>
          <strong>{log.user_ID?.email || "—"}</strong>
        </div>
        <div className="fact">
          <span>Hotspot</span>
          <strong>{log.hotspot?.nome || (log.hsID != null ? `#${log.hsID}` : "—")}</strong>
        </div>
        <div className="fact">
          <span>Quando</span>
          <strong>{log.created_at ? new Date(log.created_at).toLocaleString("pt-BR") : "—"}</strong>
        </div>
        <div className="fact">
          <span>MAC</span>
          <strong>{log.mac_address || "—"}</strong>
        </div>
        <div className="fact">
          <span>IP</span>
          <strong>{log.ip_address || "—"}</strong>
        </div>
        <div className="fact">
          <span>Dispositivo</span>
          <strong>
            {[log.device?.device_type, log.device?.os, log.device?.browser].filter(Boolean).join(" · ")
              || (log.deviceID != null ? `#${log.deviceID}` : "—")}
          </strong>
        </div>
        <div className="fact">
          <span>IP do hotspot</span>
          <strong>{log.hotspot?.ip || "—"}</strong>
        </div>
      </section>

      {log.device?.user_agent ? (
        <section className="panel" style={{ padding: 18 }}>
          <p className="page-lead" style={{ marginBottom: 8 }}>User agent do dispositivo</p>
          <p style={{ margin: 0, wordBreak: "break-word" }}>{log.device.user_agent}</p>
        </section>
      ) : null}

      {error ? <p className="error-message">{error}</p> : null}

      <div className="form-actions" style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="btn" onClick={() => router.push("/devices")}>Voltar</button>
        {log.deviceID != null ? (
          <Link className="btn" href={`/device/show/${log.deviceID}`}>Ver dispositivo</Link>
        ) : null}
        {log.hotspot?.id != null ? (
          <Link className="btn" href={`/provider/hotspot/show/${log.hotspot.id}`}>Abrir hotspot</Link>
        ) : null}
      </div>
    </SideBar>
  );
};

export default ConnectionLogShowPage;
