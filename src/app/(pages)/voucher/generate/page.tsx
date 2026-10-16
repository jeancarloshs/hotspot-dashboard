"use client";

import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getAllPlans } from "@/actions/plans";
import { generateVouchers } from "@/actions/vouchers";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível gerar os vouchers.";
}

const GenerateVoucherPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<{ id?: number; name?: string }[]>([]);
  const [hotspots, setHotspots] = useState<{ id?: number; nome?: string }[]>([]);
  const [planID, setPlanID] = useState("");
  const [hsID, setHsID] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [prefix, setPrefix] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [samePasswordAsCode, setSamePasswordAsCode] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [planResponse, hotspotResponse] = await Promise.all([
        getAllPlans(),
        getAllHotspots(),
      ]);
      setPlans(asList(planResponse));
      setHotspots(asList(hotspotResponse));
    };
    load();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await generateVouchers({
      planID: Number(planID),
      quantity: Number(quantity),
      hsID: hsID ? Number(hsID) : null,
      prefix: prefix || undefined,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      samePasswordAsCode,
    });
    if (response.status === 201 || response.status === 200) {
      router.push("/vouchers");
      return;
    }
    setError(messageFrom(response.data));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Gera até 500 vouchers por lote a partir de um plano.</p>

          <label>
            Plano
            <select value={planID} onChange={(event) => setPlanID(event.target.value)} required>
              <option value="">Selecione</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </label>
          <label>
            Quantidade
            <input
              type="number"
              min={1}
              max={500}
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              required
            />
          </label>
          <label>
            Hotspot
            <select value={hsID} onChange={(event) => setHsID(event.target.value)}>
              <option value="">Opcional</option>
              {hotspots.map((hotspot) => (
                <option key={hotspot.id} value={hotspot.id}>{hotspot.nome}</option>
              ))}
            </select>
          </label>
          <label>Prefixo<input value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder="VIP" /></label>
          <label>
            Expira em
            <input type="datetime-local" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </label>
          <label>
            Senha igual ao código
            <select
              value={samePasswordAsCode ? "yes" : "no"}
              onChange={(event) => setSamePasswordAsCode(event.target.value === "yes")}
            >
              <option value="yes">Sim</option>
              <option value="no">Não</option>
            </select>
          </label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/vouchers")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>
              {loading ? "Gerando..." : "Gerar vouchers"}
            </button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default GenerateVoucherPage;
