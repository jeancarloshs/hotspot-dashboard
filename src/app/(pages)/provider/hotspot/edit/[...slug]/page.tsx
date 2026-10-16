"use client";

import { getHotspot } from "@/actions/get-hotspot";
import { queryMikrotik } from "@/actions/query-mikrotik";
import { configureMikrotik, writeMikrotik } from "@/actions/write-mikrotik";
import SideBar from "@/app/components/_ui/sidebar/Sidebar";
import { StatusPill } from "@/app/components/_ui/resource/ResourceTable";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import {
  EDITOR_GROUPS,
  EDITORS,
  EditorSpec,
  FieldSpec,
  readRow,
  rowId,
  rowLabel,
  rowsFrom,
  usesProfileList,
  yesNoValue,
} from "../editors";

type HotspotRecord = {
  id?: number;
  nome?: string;
  ip?: string;
  status?: string;
  isp?: { nome?: string };
};

function unwrapHotspot(value: unknown): HotspotRecord | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (record.nome || record.ip || record.id) return record as HotspotRecord;
  if (record.hotspot && typeof record.hotspot === "object") return record.hotspot as HotspotRecord;
  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return record.data as HotspotRecord;
  }
  return null;
}

function profileNames(value: unknown) {
  return rowsFrom(value).flatMap((row) => {
    const name = row.name;
    return typeof name === "string" && name ? [name] : [];
  });
}

function valuesFrom(editor: EditorSpec, row: Record<string, unknown>) {
  const next: Record<string, string> = {};
  for (const field of editor.fields) {
    if (field.kind === "password") continue;
    const raw = readRow(row, field.name);
    next[field.name] = field.kind === "yesno" ? yesNoValue(raw) : raw;
  }
  if (editor.fields.some((field) => field.name === "id") && !next.id) {
    next.id = rowId(row);
  }
  return next;
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.kind === "yesno") {
    return (
      <label>
        {field.label}
        <select value={value} required={field.required} onChange={(event) => onChange(event.target.value)}>
          <option value="">Manter</option>
          <option value="yes">Sim</option>
          <option value="no">Não</option>
        </select>
      </label>
    );
  }

  return (
    <label>
      {field.label}
      <input
        value={value}
        placeholder={field.placeholder}
        required={field.required}
        type={field.kind === "password" ? "password" : field.kind === "email" ? "email" : "text"}
        autoComplete={field.kind === "password" ? "new-password" : "off"}
        list={usesProfileList(field.name) ? "mk-profiles" : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

const HotspotEditPage = ({ params }: { params: Promise<{ slug: string[] }> }) => {
  const id = React.use(params).slug[0];
  const [hotspot, setHotspot] = useState<HotspotRecord | null>(null);
  const [missing, setMissing] = useState(false);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [editorId, setEditorId] = useState(EDITORS[0].id);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState("");
  const [listing, setListing] = useState(false);
  const [listError, setListError] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const editor = EDITORS.find((item) => item.id === editorId) ?? EDITORS[0];

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const response = await getHotspot(id);
      if (cancelled) return;
      const record = unwrapHotspot(response);
      if (!record) {
        setMissing(true);
        return;
      }
      setHotspot(record);
      if (!record.ip) return;
      const listed = await queryMikrotik("profiles", record.ip);
      if (cancelled || listed.error) return;
      setProfiles(profileNames(listed.data));
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!hotspot?.ip || !editor.list) {
      setRows([]);
      setListing(false);
      setListError("");
      return;
    }
    let cancelled = false;
    setRows([]);
    setListing(true);
    setListError("");
    queryMikrotik(editor.list, hotspot.ip).then((response) => {
      if (cancelled) return;
      setRows(rowsFrom(response.data, editor.listKey));
      setListError(response.error || "");
      setListing(false);
    });
    return () => {
      cancelled = true;
    };
  }, [hotspot?.ip, editor.id, editor.list, editor.listKey]);

  const chooseEditor = (nextId: string) => {
    const next = EDITORS.find((item) => item.id === nextId);
    setEditorId(nextId);
    setSelected("");
    setRows([]);
    setListError("");
    setListing(Boolean(next?.list));
    setValues({});
    setError("");
    setMessage("");
  };

  const chooseRow = (value: string) => {
    setSelected(value);
    setError("");
    setMessage("");
    if (!value) {
      setValues({});
      return;
    }
    const row = rows[Number(value)];
    if (!row) return;
    setValues(valuesFrom(editor, row));
  };

  const setField = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hotspot?.ip || pending) return;
    const missingField = editor.fields.find((field) => field.required && !values[field.name]?.trim());
    if (missingField) {
      setError(`Preencha ${missingField.label.toLowerCase()}.`);
      setMessage("");
      return;
    }
    const filled = editor.fields.filter((field) => values[field.name]?.trim());
    if (
      editor.mode === "config"
      && editor.method !== "DELETE"
      && filled.every((field) => field.name === "id")
    ) {
      setError("Informe ao menos um campo para alterar.");
      setMessage("");
      return;
    }

    setPending(true);
    setError("");
    setMessage("");
    const value = (key: string) => values[key] || "";
    const response = editor.mode === "legacy"
      ? await writeMikrotik(
          editor.action === "user"
            ? {
                action: "user",
                ip: hotspot.ip,
                name: value("name"),
                password: value("password"),
                email: value("email"),
                comment: value("comment"),
                server: value("server"),
                profile: value("profile"),
              }
            : editor.action === "profile"
              ? {
                  action: "profile",
                  ip: hotspot.ip,
                  name: value("name"),
                  rateLimit: value("rateLimit"),
                  sessionTimeout: value("sessionTimeout"),
                  idleTimeout: value("idleTimeout"),
                }
              : editor.action === "default"
                ? {
                    action: "default",
                    ip: hotspot.ip,
                    profileName: value("profileName"),
                    hotspotName: value("hotspotName"),
                  }
                : {
                    action: "login",
                    ip: hotspot.ip,
                    name: value("name"),
                    password: value("password"),
                    userIp: value("userIp"),
                  }
        )
      : await configureMikrotik({
          ip: hotspot.ip,
          method: editor.method,
          resource: editor.resource,
          body: values,
          required: editor.fields.flatMap((field) => (field.required ? [field.name] : [])),
        });

    setMessage(response.message || "");
    setError(response.error || "");
    setPending(false);
    if (response.message) {
      setValues({});
      setSelected("");
    }
  };

  return (
    <SideBar>
      {missing ? <div className="empty-state">Hotspot não encontrado.</div> : null}
      {hotspot ? (
        <>
          <div className="page-toolbar">
            <p className="page-lead">
              {hotspot.nome || "Hotspot"} · {hotspot.ip || "sem IP"} · {hotspot.isp?.nome || "sem provedor"}
            </p>
            <div className="toolbar-actions">
              <StatusPill value={hotspot.status} />
              <Link className="btn" href={`/provider/hotspot/show/${id}`}>Voltar à consulta</Link>
            </div>
          </div>

          <section className="panel">
            <div className="tool-board">
              {EDITOR_GROUPS.map((group) => (
                <div className="tool-group" key={group}>
                  <p>{group}</p>
                  {EDITORS.filter((item) => item.group === group).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={editor.id === item.id ? "tool-btn is-active" : "tool-btn"}
                      onClick={() => chooseEditor(item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
              <p className="edit-note">{editor.hint}</p>

              {!hotspot.ip ? <p className="page-lead">Este hotspot não tem IP. A edição no MikroTik fica indisponível.</p> : (
                <form className="edit-form edit-form--wide" onSubmit={submit}>
                  {editor.list ? (
                    <label className="form-full">
                      Item neste MikroTik
                      <select value={selected} onChange={(event) => chooseRow(event.target.value)}>
                        <option value="">{listing ? "Carregando..." : "Selecione para preencher"}</option>
                        {rows.map((row, index) => (
                          <option key={`${rowId(row)}-${index}`} value={String(index)}>{rowLabel(row, index)}</option>
                        ))}
                      </select>
                    </label>
                  ) : null}
                  {listError ? <p className="error-message form-full">{listError}</p> : null}
                  {editor.list && !listing && !listError && rows.length === 0 ? (
                    <p className="edit-note form-full">Nenhum item encontrado. O identificador ainda pode ser informado manualmente.</p>
                  ) : null}

                  {editor.fields.map((field) => (
                    <FieldControl
                      key={field.name}
                      field={field}
                      value={values[field.name] ?? ""}
                      onChange={(next) => setField(field.name, next)}
                    />
                  ))}

                  <datalist id="mk-profiles">
                    {profiles.map((name) => <option key={name} value={name} />)}
                  </datalist>

                  {error ? <p className="error-message form-full">{error}</p> : null}
                  {message ? <p className="form-success form-full">{message}</p> : null}

                  <div className="form-actions">
                    <button
                      className={editor.mode === "config" && editor.method === "DELETE" ? "btn btn--danger" : "btn btn--solid"}
                      type="submit"
                      disabled={pending}
                    >
                      {pending
                        ? "Enviando..."
                        : editor.mode === "config" && editor.method === "DELETE"
                          ? "Remover no MikroTik"
                          : "Salvar no MikroTik"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </>
      ) : null}
    </SideBar>
  );
};

export default HotspotEditPage;
