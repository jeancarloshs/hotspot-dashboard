"use client";

import { createUser } from "@/actions/create-user";
import { getAllProviders } from "@/actions/get-all-provideres";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import IProvider from "@/app/interface/IProviders";
import { messageFrom } from "@/app/lib/message";
import { PERMISSIONS, USER_STATUSES, permissionLabel } from "@/app/lib/user-options";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const InsertUserPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<IProvider[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    permission: "administrador",
    status: "ativo",
    ispID: "",
  });

  useEffect(() => {
    const load = async () => {
      const response = await getAllProviders();
      setProviders(asList<IProvider>(response));
    };
    load();
  }, []);

  const setField = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await createUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      permission: formData.permission,
      status: formData.status,
      ispID: Number(formData.ispID),
    });

    if (response.status === 201 || response.status === 200) {
      router.push("/users");
      return;
    }
    setError(messageFrom(response.data));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">Esta conta entra no painel. A senha não fica visível depois de salva.</p>

          <h2 className="form-span">Acesso</h2>
          <label>Nome<input value={formData.name} onChange={(event) => setField("name", event.target.value)} required autoComplete="off" /></label>
          <label>E-mail<input type="email" value={formData.email} onChange={(event) => setField("email", event.target.value)} required autoComplete="off" /></label>
          <label>Senha<input type="password" value={formData.password} onChange={(event) => setField("password", event.target.value)} required autoComplete="new-password" /></label>
          <label>
            Permissão
            <select value={formData.permission} onChange={(event) => setField("permission", event.target.value)}>
              {PERMISSIONS.map((permission) => (
                <option key={permission} value={permission}>{permissionLabel(permission)}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={formData.status} onChange={(event) => setField("status", event.target.value)}>
              {USER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            Provedor
            <select value={formData.ispID} onChange={(event) => setField("ispID", event.target.value)} required>
              <option value="">Selecione</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>{provider.nome}</option>
              ))}
            </select>
          </label>

          {error ? <p className="error-message form-span">{error}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/users")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar usuário"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default InsertUserPage;
