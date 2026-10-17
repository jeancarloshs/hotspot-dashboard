"use client";

import { deleteUser } from "@/actions/delete-user";
import { getAllProviders } from "@/actions/get-all-provideres";
import { getAllUsers } from "@/actions/get-all-users";
import { updateUser } from "@/actions/update-user";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import { useAcl } from "@/app/hooks/use-acl";
import IProvider from "@/app/interface/IProviders";
import { messageFrom } from "@/app/lib/message";
import {
  PERMISSION_HINTS,
  PERMISSIONS,
  USER_STATUSES,
  assignablePermissions,
  permissionLabel,
} from "@/app/lib/user-options";
import { useRouter } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";

type SystemUser = {
  id?: number;
  name?: string;
  email?: string;
  status?: string;
  permission?: string;
  isp?: { id?: number; nome?: string };
};

const UserShowPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const router = useRouter();
  const { permission: actorPermission, can } = useAcl();
  const id = React.use(params).slug[0];
  const [ready, setReady] = useState(false);
  const options = useMemo(
    () => assignablePermissions(actorPermission),
    [actorPermission]
  );
  const [missing, setMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permission: "administrador",
    status: "ativo",
    ispID: "",
  });

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    const load = async () => {
      const [usersResult, providersResult] = await Promise.all([
        getAllUsers(),
        getAllProviders(),
      ]);
      setProviders(asList<IProvider>(providersResult));
      const found = asList<SystemUser>(usersResult).find((item) => String(item.id) === id) ?? null;
      if (!found) {
        setMissing(true);
        setReady(true);
        return;
      }
      const status = String(found.status || "ativo").toLowerCase();
      setForm({
        name: found.name || "",
        email: found.email || "",
        password: "",
        permission: found.permission || "administrador",
        status: USER_STATUSES.includes(status as (typeof USER_STATUSES)[number]) ? status : "ativo",
        ispID: found.isp?.id ? String(found.isp.id) : "",
      });
      setReady(true);
    };
    load();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await updateUser(id, {
      name: form.name,
      email: form.email,
      password: form.password.trim() || undefined,
      permission: form.permission,
      status: form.status,
      ispID: Number(form.ispID),
    });
    if (response.status === 200) {
      router.push("/users");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível atualizar o usuário."));
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError("");
    const response = await deleteUser(id);
    if (response.status === 200) {
      router.push("/users");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível excluir o usuário."));
    setDeleting(false);
  };

  if (!ready) {
    return (
      <SideBar>
        <div className="empty-state">Carregando usuário...</div>
      </SideBar>
    );
  }

  if (missing) {
    return (
      <SideBar>
        <div className="empty-state">Usuário não encontrado.</div>
      </SideBar>
    );
  }

  const canDelete = can("users.delete");

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">A senha só muda se você preencher o campo. Em branco, a senha atual permanece.</p>

          <h2 className="form-span">Acesso</h2>
          <label>Nome<input value={form.name} onChange={(event) => setField("name", event.target.value)} required autoComplete="off" /></label>
          <label>E-mail<input type="email" value={form.email} onChange={(event) => setField("email", event.target.value)} required autoComplete="off" /></label>
          <label>Nova senha<input type="password" value={form.password} onChange={(event) => setField("password", event.target.value)} autoComplete="new-password" /></label>
          <label>
            Permissão
            <select value={form.permission} onChange={(event) => setField("permission", event.target.value)}>
              {!options.includes(form.permission) && form.permission ? (
                <option value={form.permission}>{permissionLabel(form.permission)}</option>
              ) : null}
              {options.map((permission) => (
                <option key={permission} value={permission}>
                  {permissionLabel(permission)}
                  {PERMISSIONS.includes(permission as (typeof PERMISSIONS)[number])
                    ? ` — ${PERMISSION_HINTS[permission as (typeof PERMISSIONS)[number]]}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={form.status} onChange={(event) => setField("status", event.target.value)}>
              {USER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Provedor
            <select value={form.ispID} onChange={(event) => setField("ispID", event.target.value)} required>
              <option value="">Selecione</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.nome}</option>
              ))}
            </select>
          </label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          {canDelete && confirmDelete ? (
            <div className="confirm-reboot form-full">
              <p>Excluir {form.name || "este usuário"}?</p>
              <div className="form-actions">
                <button type="button" className="btn" onClick={() => setConfirmDelete(false)}>Cancelar</button>
                <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          ) : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/users")}>Voltar</button>
            {canDelete && !confirmDelete ? (
              <button type="button" className="btn btn--danger" onClick={() => setConfirmDelete(true)}>Excluir usuário</button>
            ) : null}
            <button type="submit" className="btn btn--solid" disabled={saving}>{saving ? "Salvando..." : "Salvar usuário"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default UserShowPage;
