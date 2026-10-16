"use client";

import { createDevice, DeviceInput } from "@/actions/create-device";
import { digits } from "@/app/components/_ui/client/client-fields";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { messageFrom } from "@/app/lib/message";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const DEVICE_TYPES = ["desktop", "mobile", "tablet"];

type DeviceForm = {
  cpf: string;
  user_agent: string;
  device_type: string;
  os: string;
  os_version: string;
  browser: string;
  browser_version: string;
  screen_width: string;
  screen_height: string;
};

const emptyDevice = (): DeviceForm => ({
  cpf: "",
  user_agent: "",
  device_type: "desktop",
  os: "",
  os_version: "",
  browser: "",
  browser_version: "",
  screen_width: "",
  screen_height: "",
});

function detectDevice(): Partial<DeviceForm> {
  const ua = navigator.userAgent;
  let device_type = "desktop";
  if (/Tablet|iPad/i.test(ua)) device_type = "tablet";
  else if (/Mobi|Android/i.test(ua)) device_type = "mobile";

  let os = "";
  let os_version = "";
  const windows = ua.match(/Windows NT ([\d.]+)/);
  const mac = ua.match(/Mac OS X ([\d_]+)/);
  const android = ua.match(/Android ([\d.]+)/);
  const ios = ua.match(/OS ([\d_]+) like Mac OS X/);
  if (windows) {
    os = "Windows";
    os_version = windows[1];
  } else if (android) {
    os = "Android";
    os_version = android[1];
  } else if (ios) {
    os = "iOS";
    os_version = ios[1].replace(/_/g, ".");
  } else if (mac) {
    os = "macOS";
    os_version = mac[1].replace(/_/g, ".");
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  let browser = "";
  let browser_version = "";
  const edge = ua.match(/Edg\/([\d.]+)/);
  const firefox = ua.match(/Firefox\/([\d.]+)/);
  const chrome = ua.match(/Chrome\/([\d.]+)/);
  const safari = ua.match(/Version\/([\d.]+).*Safari/);
  if (edge) {
    browser = "Edge";
    browser_version = edge[1];
  } else if (firefox) {
    browser = "Firefox";
    browser_version = firefox[1];
  } else if (chrome) {
    browser = "Chrome";
    browser_version = chrome[1];
  } else if (safari) {
    browser = "Safari";
    browser_version = safari[1];
  }

  return {
    user_agent: ua,
    device_type,
    os,
    os_version,
    browser,
    browser_version,
    screen_width: String(window.screen.width || ""),
    screen_height: String(window.screen.height || ""),
  };
}

function formatCPF(value: string) {
  return digits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const InsertDevicePage = () => {
  const router = useRouter();
  const [form, setForm] = useState<DeviceForm>(emptyDevice);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm((current) => ({ ...current, ...detectDevice() }));
  }, []);

  const setField = (key: keyof DeviceForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const body: DeviceInput = { cpf: digits(form.cpf) };
    const textKeys = ["user_agent", "device_type", "os", "os_version", "browser", "browser_version"] as const;
    for (const key of textKeys) {
      const value = form[key].trim();
      if (value) body[key] = value;
    }
    const width = Number(form.screen_width);
    const height = Number(form.screen_height);
    if (form.screen_width.trim() && Number.isFinite(width)) body.screen_width = width;
    if (form.screen_height.trim() && Number.isFinite(height)) body.screen_height = height;

    const response = await createDevice(body);
    setLoading(false);
    if (response.status === 201 || response.status === 200) {
      setSuccess("Dispositivo registrado para este CPF.");
      setForm((current) => ({ ...emptyDevice(), ...detectDevice(), cpf: "" }));
      return;
    }
    setError(messageFrom(response.data, "Não foi possível registrar o dispositivo."));
  };

  const typeKnown = DEVICE_TYPES.includes(form.device_type);

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">O CPF precisa ser de um cliente já cadastrado. Os dados do aparelho começam pelo navegador atual.</p>

          <h2 className="form-span">Cliente</h2>
          <label>
            CPF
            <input value={formatCPF(form.cpf)} onChange={(event) => setField("cpf", event.target.value)} required inputMode="numeric" autoComplete="off" />
          </label>

          <h2 className="form-span">Aparelho</h2>
          <label>
            Tipo
            <select value={form.device_type} onChange={(event) => setField("device_type", event.target.value)}>
              {!typeKnown && form.device_type ? <option value={form.device_type}>{form.device_type}</option> : null}
              {DEVICE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <label>
            Sistema
            <input value={form.os} onChange={(event) => setField("os", event.target.value)} />
          </label>
          <label>
            Versão do sistema
            <input value={form.os_version} onChange={(event) => setField("os_version", event.target.value)} />
          </label>
          <label>
            Navegador
            <input value={form.browser} onChange={(event) => setField("browser", event.target.value)} />
          </label>
          <label>
            Versão do navegador
            <input value={form.browser_version} onChange={(event) => setField("browser_version", event.target.value)} />
          </label>
          <label>
            Largura da tela
            <input value={form.screen_width} onChange={(event) => setField("screen_width", event.target.value)} inputMode="numeric" />
          </label>
          <label>
            Altura da tela
            <input value={form.screen_height} onChange={(event) => setField("screen_height", event.target.value)} inputMode="numeric" />
          </label>
          <label className="form-full">
            User agent
            <input value={form.user_agent} onChange={(event) => setField("user_agent", event.target.value)} />
          </label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          {success ? <p className="form-success form-span">{success}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/clients")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Registrar dispositivo"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default InsertDevicePage;
