"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { redeemVoucher } from "@/actions/vouchers";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { FormEvent, useEffect, useState } from "react";

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

const RedeemVoucherPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string }[]>([]);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [hsID, setHsID] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await getAllHotspots();
      setHotspots(asList(response));
    };
    load();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const response = await redeemVoucher({
      code: code.trim(),
      hsID: Number(hsID),
      password: password || undefined,
    });
    if (response.status === 200 || response.status === 201) {
      setMessage(messageFrom(response.data, "Voucher resgatado."));
      setLoading(false);
      return;
    }
    setError(messageFrom(response.data, "Não foi possível resgatar o voucher."));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Rota pública: valida o código no hotspot informado.</p>

          <label>Código<input value={code} onChange={(event) => setCode(event.target.value)} required placeholder="VIP-AB12CD34" /></label>
          <label>Senha<input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Opcional" /></label>
          <label>
            Hotspot
            <select value={hsID} onChange={(event) => setHsID(event.target.value)} required>
              <option value="">Selecione</option>
              {hotspots.map((hotspot) => (
                <option key={hotspot.id} value={hotspot.id}>{hotspot.nome}</option>
              ))}
            </select>
          </label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          {message ? <p className="form-success form-span">{message}</p> : null}
          <div className="form-actions">
            <button type="submit" className="btn btn--solid" disabled={loading}>
              {loading ? "Resgatando..." : "Resgatar voucher"}
            </button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default RedeemVoucherPage;
