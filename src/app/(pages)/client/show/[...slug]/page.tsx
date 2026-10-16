"use client";

import { deleteClient } from "@/actions/delete-client";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import { getClient } from "@/actions/get-client";
import { updateClient } from "@/actions/update-client";
import {
  ClientFields,
  ClientFormState,
  HotspotOption,
  clientPayload,
  dateInput,
  emptyClientForm,
} from "@/app/components/_ui/client/client-fields";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { messageFrom } from "@/app/lib/message";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useState } from "react";

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asClient(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if ("email" in record || "nome_completo" in record || "id" in record) return record;
  for (const key of ["client", "data", "user"]) {
    const nested = record[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) return nested as Record<string, unknown>;
  }
  return null;
}

const ClientPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const id = React.use(params).slug[0];
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [hotspots, setHotspots] = useState<HotspotOption[]>([]);
  const [form, setForm] = useState<ClientFormState>(emptyClientForm);

  const setField = (key: keyof ClientFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const load = async () => {
      const [clientResult, hotspotResult] = await Promise.all([
        getClient(id),
        getAllHotspots(),
      ]);
      setHotspots(asList<HotspotOption>(hotspotResult));
      const client = clientResult.status === 200 ? asClient(clientResult.data) : null;
      if (!client) {
        setMissing(true);
        setReady(true);
        return;
      }
      const hotspot = client.hotspot as { id?: number } | undefined;
      const hsID = client.hsID ?? hotspot?.id ?? "";
      setForm({
        ...emptyClientForm(),
        nome_completo: text(client.nome_completo),
        cpf: text(client.cpf),
        telefone: text(client.telefone),
        data_nascimento: dateInput(text(client.data_nascimento)),
        email: text(client.email),
        cep: text(client.cep),
        endereco: text(client.endereco),
        numero: text(client.numero),
        bairro: text(client.bairro),
        cidade: text(client.cidade),
        estado: text(client.estado),
        complemento: text(client.complemento),
        tipo_usuario: text(client.tipo_usuario) || "usuario_regular",
        ip_local: text(client.ip_local),
        hsID: String(hsID),
      });
      setReady(true);
    };
    load();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await updateClient(id, clientPayload(form));
    if (response.status === 200) {
      router.push("/clients");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível atualizar o cliente."));
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deleteClient(id);
    if (response.status === 200) {
      router.push("/clients");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível excluir o cliente."));
    setDeleting(false);
  };

  if (!ready) {
    return (
      <SideBar>
        <div className="empty-state">Carregando cliente...</div>
      </SideBar>
    );
  }

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Cliente não encontrado.</div>
      </SideBar>
    );
  }

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">A atualização envia a senha junto com o cadastro. O CEP preenche o endereço.</p>
          <ClientFields
            form={form}
            hotspots={hotspots}
            onChange={setField}
            onAddress={(address) => setForm((current) => ({ ...current, ...address }))}
          />
          {error ? <p className="error-message form-span">{error}</p> : null}
          {confirmDelete ? (
            <div className="confirm-reboot form-full">
              <p>Excluir este cliente remove o cadastro de acesso.</p>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/clients")}>Voltar</button>
            {confirmDelete ? null : (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir cliente</button>
            )}
            <button type="submit" className="btn btn--solid" disabled={saving}>{saving ? "Salvando..." : "Salvar cliente"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default ClientPage;
