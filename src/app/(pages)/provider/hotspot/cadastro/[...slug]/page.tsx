"use client";

import { deleteHotspot } from "@/actions/delete-hotspot";
import { getCep } from "@/actions/get-cep";
import { getAllProviders } from "@/actions/get-all-provideres";
import { getHotspot } from "@/actions/get-hotspot";
import { updateHotspot } from "@/actions/update-hotspot";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

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

function messageFrom(data: unknown, fallback: string) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return fallback;
}

function unwrapHotspot(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.nome || record.ip || record.id) return record;
  if (record.hotspot && typeof record.hotspot === "object") return record.hotspot as Record<string, unknown>;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as Record<string, unknown>;
  }
  return null;
}

const HotspotCadastroPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [formData, setFormData] = useState<HotspotForm>(emptyHotspot);

  const setField = (key: keyof HotspotForm, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const load = async () => {
      const [hotspotResponse, providerResponse] = await Promise.all([
        getHotspot(id),
        getAllProviders(),
      ]);
      setProviders(asList<IProvider>(providerResponse));
      const hotspot = unwrapHotspot(hotspotResponse);
      if (!hotspot) {
        setMissing(true);
        return;
      }
      const isp = hotspot.isp && typeof hotspot.isp === "object"
        ? hotspot.isp as { id?: number }
        : null;
      const status = String(hotspot.status || "ativo").toLowerCase();
      setFormData({
        nome: String(hotspot.nome || ""),
        ip: String(hotspot.ip || ""),
        status: STATUSES.includes(status) ? status : "ativo",
        ispID: String(hotspot.ispID ?? isp?.id ?? ""),
        cep: String(hotspot.cep || ""),
        endereco: String(hotspot.endereco || ""),
        numero: String(hotspot.numero || ""),
        complemento: String(hotspot.complemento || ""),
        bairro: String(hotspot.bairro || ""),
        cidade: String(hotspot.cidade || ""),
        estado: String(hotspot.estado || ""),
      });
    };
    load();
  }, [id]);

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
    const response = await updateHotspot(id, {
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

    if (response.status === 200) {
      router.push(`/provider/hotspot/show/${id}`);
      return;
    }
    setError(messageFrom(response.data, "Não foi possível salvar o hotspot."));
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deleteHotspot(id);
    if (response.status === 200) {
      router.push("/hotspots");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível excluir o hotspot."));
    setDeleting(false);
  };

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Hotspot não encontrado.</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Atualiza o cadastro do ponto de acesso. A configuração do MikroTik fica na tela de edição.</p>

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
          {confirmDelete ? (
            <div className="confirm-reboot form-full">
              <p>Excluir este hotspot remove o cadastro. As configurações no MikroTik não são apagadas por aqui.</p>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push(`/provider/hotspot/show/${id}`)}>Voltar</button>
            {confirmDelete ? null : (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir hotspot</button>
            )}
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar hotspot"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default HotspotCadastroPage;
