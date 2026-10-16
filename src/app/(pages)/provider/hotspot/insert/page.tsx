"use client";

import { createHotspot } from "@/actions/create-hotspot";
import { getCep } from "@/actions/get-cep";
import { getAllProviders } from "@/actions/get-all-provideres";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const STATUSES = ["ativo", "inativo", "bloqueado", "pendente", "rejeitado", "cancelado"];

type HotspotForm = {
  nome: string;
  ip: string;
  status: string;
  ispID: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
};

const emptyHotspot = (): HotspotForm => ({
  nome: "",
  ip: "",
  status: "ativo",
  ispID: "",
  cep: "",
  endereco: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
});

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCEP(cep: string) {
  return digits(cep).replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2-$3");
}

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível salvar o hotspot.";
}

const InsertHotspotPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [formData, setFormData] = useState<HotspotForm>(emptyHotspot);

  useEffect(() => {
    const load = async () => {
      const response = await getAllProviders();
      setProviders(asList<IProvider>(response));
    };
    load();
  }, []);

  const setField = (key: keyof HotspotForm, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleCepBlur = async () => {
    const cep = digits(formData.cep);
    if (cep.length !== 8) return;
    const response = await getCep(cep);
    if (!response) return;
    setFormData((current) => ({
      ...current,
      endereco: response.logradouro,
      bairro: response.bairro,
      cidade: response.localidade,
      estado: response.uf,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await createHotspot({
      nome: formData.nome,
      ip: formData.ip,
      status: formData.status,
      ispID: Number(formData.ispID),
      cep: formatCEP(formData.cep),
      endereco: formData.endereco,
      numero: formData.numero,
      complemento: formData.complemento,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
    });

    if (response.status === 201) {
      router.push("/hotspots");
      return;
    }
    setError(messageFrom(response.data));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">O IP é o endereço real do MikroTik, com pontos. O CEP preenche o endereço.</p>

          <h2 className="form-span">Ponto de acesso</h2>
          <label>Nome<input value={formData.nome} onChange={(event) => setField("nome", event.target.value)} required /></label>
          <label>IP<input value={formData.ip} onChange={(event) => setField("ip", event.target.value)} placeholder="192.168.88.1" required /></label>
          <label>
            Provedor
            <select value={formData.ispID} onChange={(event) => setField("ispID", event.target.value)} required>
              <option value="">Selecione</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.nome}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={formData.status} onChange={(event) => setField("status", event.target.value)}>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>

          <h2 className="form-span">Endereço</h2>
          <label>CEP<input value={formatCEP(formData.cep)} onChange={(event) => setField("cep", event.target.value)} onBlur={handleCepBlur} inputMode="numeric" /></label>
          <label>Endereço<input value={formData.endereco} onChange={(event) => setField("endereco", event.target.value)} /></label>
          <label>Número<input value={formData.numero} onChange={(event) => setField("numero", event.target.value)} /></label>
          <label>Complemento<input value={formData.complemento} onChange={(event) => setField("complemento", event.target.value)} /></label>
          <label>Bairro<input value={formData.bairro} onChange={(event) => setField("bairro", event.target.value)} /></label>
          <label>Cidade<input value={formData.cidade} onChange={(event) => setField("cidade", event.target.value)} /></label>
          <label>Estado<input value={formData.estado} onChange={(event) => setField("estado", event.target.value)} maxLength={2} /></label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/hotspots")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar hotspot"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default InsertHotspotPage;
