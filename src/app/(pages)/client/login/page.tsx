"use client";

import { clientLogin } from "@/actions/client-login";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import { HotspotOption } from "@/app/components/_ui/client/client-fields";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { messageFrom } from "@/app/lib/message";
import { FormEvent, useEffect, useState } from "react";

const ClientLoginPage = () => {
  const [hotspots, setHotspots] = useState<HotspotOption[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hsID, setHsID] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllHotspots();
      setHotspots(asList<HotspotOption>(response));
    };
    load();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const response = await clientLogin({
      email: email.trim(),
      password,
      hsID: Number(hsID),
    });
    setLoading(false);
    if (response.status === 200) {
      setSuccess("Cliente autenticado neste hotspot.");
      setPassword("");
      return;
    }
    setError(messageFrom(response.data, "E-mail, senha ou hotspot incorretos."));
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Este acesso é do cliente no hotspot. Ele não entra no painel.</p>
          <label>
            E-mail
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="off" />
          </label>
          <label>
            Senha
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" />
          </label>
          <label>
            Hotspot
            <select value={hsID} onChange={(event) => setHsID(event.target.value)} required>
              <option value="">Selecione</option>
              {hotspots.map((hotspot) => (
                <option key={hotspot.id} value={hotspot.id}>{hotspot.nome || `Hotspot ${hotspot.id}`}</option>
              ))}
            </select>
          </label>
          {error ? <p className="error-message form-span">{error}</p> : null}
          {success ? <p className="form-success form-span">{success}</p> : null}
          <div className="form-actions">
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default ClientLoginPage;
