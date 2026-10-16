"use client";

import { deleteProvider } from "@/actions/delete-provider";
import { getCep } from "@/actions/get-cep";
import { getCNPJ } from "@/actions/get-cnpj";
import { getProvider } from "@/actions/get-provider";
import { updateProvider } from "@/actions/update-provider";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import IProvider from "@/app/interface/IProviders";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

const STATUSES = ["ativo", "inativo", "bloqueado", "pendente", "rejeitado", "cancelado"];

const emptyProvider = (): IProvider => ({
  nome: "",
  cnpj: "",
  razao_social: "",
  endereco: "",
  telefone: "",
  celular: "",
  email: "",
  site: "",
  numero: "",
  complemento: "",
  cidade: "",
  bairro: "",
  cep: "",
  estado: "",
  status: "ativo",
});

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCNPJ(cnpj?: string | null) {
  if (!cnpj) return "";
  return digits(cnpj).replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatCEP(cep?: string | null) {
  if (!cep) return "";
  return digits(cep).replace(/^(\d{2})(\d{3})(\d{3})$/, "$1.$2-$3");
}

function formatTel(telefone?: string | null) {
  if (!telefone) return "";
  const cleaned = digits(telefone);
  if (cleaned.length === 10) return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  if (cleaned.length === 11) return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  return telefone;
}

function text(value?: string | null) {
  return value || "";
}

function messageFrom(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "message" in data && typeof data.message === "string") return data.message;
  return "Não foi possível salvar o provedor.";
}

const ProviderPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const slug = React.use(params).slug[0];
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<IProvider>(emptyProvider);

  const setField = (key: keyof IProvider, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const load = async () => {
      const provider = await getProvider(slug);
      if (!provider?.nome && !provider?.id) {
        setMissing(true);
        return;
      }
      const status = String(provider.status || "ativo").toLowerCase();
      setFormData({
        ...emptyProvider(),
        ...provider,
        status: STATUSES.includes(status) ? status : "ativo",
      });
    };
    load();
  }, [slug]);

  const handleCepBlur = async () => {
    const cep = digits(formData.cep || "");
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

  const handleCNPJBlur = async () => {
    const cnpj = (formData.cnpj || "").replace(/[.\-/]/g, "");
    if (cnpj.length !== 14) return;
    const response = await getCNPJ(cnpj);
    if (!response) return;
    setFormData((current) => ({
      ...current,
      nome: response.nome_fantasia || current.nome,
      razao_social: response.razao_social || current.razao_social,
      telefone: response.ddd_telefone_1 || current.telefone,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const telefone = formatTel(formData.telefone);
    const celular = formatTel(formData.celular);
    const response = await updateProvider(slug, {
      ...formData,
      cnpj: formatCNPJ(formData.cnpj),
      cep: formatCEP(formData.cep),
      telefone: telefone || null,
      celular: celular || null,
      status: String(formData.status || "ativo").toLowerCase(),
    });

    if (response.status === 200) {
      router.push("/providers");
      return;
    }
    setError(messageFrom(response.data));
    setLoading(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deleteProvider(slug);
    if (response.status === 200) {
      router.push("/providers");
      return;
    }
    setError(messageFrom(response.data));
    setDeleting(false);
  };

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Provedor não encontrado.</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">O CNPJ preenche nome e telefone. O CEP preenche o endereço.</p>

          <h2 className="form-span">Identificação</h2>
          <label>Nome<input value={text(formData.nome)} onChange={(event) => setField("nome", event.target.value)} required /></label>
          <label>CNPJ<input value={formatCNPJ(formData.cnpj)} onChange={(event) => setField("cnpj", event.target.value)} onBlur={handleCNPJBlur} inputMode="numeric" /></label>
          <label>Razão social<input value={text(formData.razao_social)} onChange={(event) => setField("razao_social", event.target.value)} /></label>
          <label>
            Status
            <select value={text(formData.status) || "ativo"} onChange={(event) => setField("status", event.target.value)}>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>

          <h2 className="form-span">Contato</h2>
          <label>Telefone<input value={formatTel(formData.telefone)} onChange={(event) => setField("telefone", event.target.value)} inputMode="tel" /></label>
          <label>Celular<input value={formatTel(formData.celular)} onChange={(event) => setField("celular", event.target.value)} inputMode="tel" /></label>
          <label>E-mail<input type="email" value={text(formData.email)} onChange={(event) => setField("email", event.target.value)} /></label>
          <label>Site<input value={text(formData.site)} onChange={(event) => setField("site", event.target.value)} /></label>

          <h2 className="form-span">Endereço</h2>
          <label>CEP<input value={formatCEP(formData.cep)} onChange={(event) => setField("cep", event.target.value)} onBlur={handleCepBlur} inputMode="numeric" /></label>
          <label>Endereço<input value={text(formData.endereco)} onChange={(event) => setField("endereco", event.target.value)} /></label>
          <label>Número<input value={text(formData.numero)} onChange={(event) => setField("numero", event.target.value)} /></label>
          <label>Complemento<input value={text(formData.complemento)} onChange={(event) => setField("complemento", event.target.value)} /></label>
          <label>Bairro<input value={text(formData.bairro)} onChange={(event) => setField("bairro", event.target.value)} /></label>
          <label>Cidade<input value={text(formData.cidade)} onChange={(event) => setField("cidade", event.target.value)} /></label>
          <label>Estado<input value={text(formData.estado)} onChange={(event) => setField("estado", event.target.value)} maxLength={2} /></label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          {confirmDelete ? (
            <div className="confirm-reboot form-full">
              <p>Excluir este provedor remove o cadastro. Os hotspots vinculados podem ficar sem provedor.</p>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/providers")}>Voltar</button>
            <button type="button" className="btn" onClick={() => router.push(`/provider/hotspots/${slug}`)}>Hotspots</button>
            {confirmDelete ? null : (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir provedor</button>
            )}
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar provedor"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default ProviderPage;
