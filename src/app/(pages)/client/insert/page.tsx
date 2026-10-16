"use client";

import { createClient } from "@/actions/create-client";
import { getAllHotspots } from "@/actions/get-all-hotspots";
import { ClientFields, ClientFormState, HotspotOption, clientPayload, emptyClientForm } from "@/app/components/_ui/client/client-fields";
import { asList } from "@/app/components/_ui/resource/ResourceTable";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { messageFrom } from "@/app/lib/message";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const InsertClientPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hotspots, setHotspots] = useState<HotspotOption[]>([]);
  const [form, setForm] = useState<ClientFormState>(emptyClientForm);

  useEffect(() => {
    const load = async () => {
      const response = await getAllHotspots();
      setHotspots(asList<HotspotOption>(response));
    };
    load();
  }, []);

  const setField = (key: keyof ClientFormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await createClient(clientPayload(form));
    if (response.status === 201 || response.status === 200) {
      router.push("/clients");
      return;
    }
    setError(messageFrom(response.data, "Não foi possível cadastrar o cliente."));
    setLoading(false);
  };

  return (
    <SideBar>
      <section className="panel">
        <form className="edit-form edit-form--wide tool-board" onSubmit={handleSubmit}>
          <p className="edit-note form-full">O mesmo e-mail pode existir em outro hotspot. O CEP preenche o endereço.</p>
          <ClientFields
            form={form}
            hotspots={hotspots}
            onChange={setField}
            onAddress={(address) => setForm((current) => ({ ...current, ...address }))}
          />
          {error ? <p className="error-message form-span">{error}</p> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => router.push("/clients")}>Voltar</button>
            <button type="submit" className="btn btn--solid" disabled={loading}>{loading ? "Salvando..." : "Salvar cliente"}</button>
          </div>
        </form>
      </section>
    </SideBar>
  );
};

export default InsertClientPage;
