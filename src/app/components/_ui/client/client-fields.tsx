"use client";

import { getCep } from "@/actions/get-cep";

export const CLIENT_TYPES = [
  { value: "visitante", label: "Visitante" },
  { value: "usuario_regular", label: "Usuário regular" },
  { value: "usuario_premium", label: "Usuário premium" },
  { value: "suporte", label: "Suporte" },
  { value: "moderador", label: "Moderador" },
  { value: "gerente", label: "Gerente" },
  { value: "administrador", label: "Administrador" },
  { value: "super_admin", label: "Super administrador" },
];

export type HotspotOption = {
  id?: number;
  nome?: string;
};

export type ClientFormState = {
  nome_completo: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  email: string;
  password: string;
  cep: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  tipo_usuario: string;
  ip_local: string;
  hsID: string;
};

const OPTIONAL_KEYS = [
  "nome_completo",
  "cpf",
  "telefone",
  "data_nascimento",
  "cep",
  "endereco",
  "numero",
  "bairro",
  "cidade",
  "estado",
  "complemento",
  "tipo_usuario",
  "ip_local",
] as const;

export function emptyClientForm(): ClientFormState {
  return {
    nome_completo: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    email: "",
    password: "",
    cep: "",
    endereco: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
    tipo_usuario: "usuario_regular",
    ip_local: "",
    hsID: "",
  };
}

export function digits(value: string) {
  return value.replace(/\D/g, "");
}

export function formatCPF(value: string) {
  return digits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function formatCEP(value: string) {
  return digits(value).slice(0, 8).replace(/^(\d{2})(\d{3})(\d{0,3})$/, (_, a, b, c) => (c ? `${a}.${b}-${c}` : `${a}.${b}`));
}

export function clientPayload(form: ClientFormState) {
  const body: Record<string, string | number> = {
    email: form.email.trim(),
    password: form.password,
    hsID: Number(form.hsID),
  };

  for (const key of OPTIONAL_KEYS) {
    const raw = form[key].trim();
    if (!raw) continue;
    if (key === "cpf") body[key] = digits(raw);
    else if (key === "cep") body[key] = digits(raw);
    else body[key] = raw;
  }

  return body;
}

export function dateInput(value?: string | null) {
  if (!value) return "";
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : "";
}

type ClientFieldsProps = {
  form: ClientFormState;
  hotspots: HotspotOption[];
  onChange: (key: keyof ClientFormState, value: string) => void;
  onAddress: (address: Pick<ClientFormState, "endereco" | "bairro" | "cidade" | "estado">) => void;
};

export function ClientFields({ form, hotspots, onChange, onAddress }: ClientFieldsProps) {
  const knownType = CLIENT_TYPES.some((type) => type.value === form.tipo_usuario);

  const handleCepBlur = async () => {
    const cep = digits(form.cep);
    if (cep.length !== 8) return;
    const response = await getCep(cep);
    if (!response || response.erro) return;
    onAddress({
      endereco: response.logradouro || "",
      bairro: response.bairro || "",
      cidade: response.localidade || "",
      estado: response.uf || "",
    });
  };

  return (
    <>
      <h2 className="form-span">Acesso</h2>
      <label>
        Nome
        <input value={form.nome_completo} onChange={(event) => onChange("nome_completo", event.target.value)} autoComplete="name" />
      </label>
      <label>
        E-mail
        <input type="email" value={form.email} onChange={(event) => onChange("email", event.target.value)} required autoComplete="off" />
      </label>
      <label>
        Senha
        <input type="password" value={form.password} onChange={(event) => onChange("password", event.target.value)} required autoComplete="new-password" />
      </label>
      <label>
        Tipo
        <select value={form.tipo_usuario} onChange={(event) => onChange("tipo_usuario", event.target.value)}>
          {!knownType && form.tipo_usuario ? <option value={form.tipo_usuario}>{form.tipo_usuario}</option> : null}
          {CLIENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </label>
      <label>
        Hotspot
        <select value={form.hsID} onChange={(event) => onChange("hsID", event.target.value)} required>
          <option value="">Selecione</option>
          {hotspots.map((hotspot) => (
            <option key={hotspot.id} value={hotspot.id}>{hotspot.nome || `Hotspot ${hotspot.id}`}</option>
          ))}
        </select>
      </label>
      <label>
        IP local
        <input value={form.ip_local} onChange={(event) => onChange("ip_local", event.target.value)} placeholder="192.168.88.10" autoComplete="off" />
      </label>

      <h2 className="form-span">Documento</h2>
      <label>
        CPF
        <input value={formatCPF(form.cpf)} onChange={(event) => onChange("cpf", event.target.value)} inputMode="numeric" autoComplete="off" />
      </label>
      <label>
        Telefone
        <input value={form.telefone} onChange={(event) => onChange("telefone", event.target.value)} inputMode="tel" autoComplete="tel" />
      </label>
      <label>
        Nascimento
        <input type="date" value={form.data_nascimento} onChange={(event) => onChange("data_nascimento", event.target.value)} />
      </label>

      <h2 className="form-span">Endereço</h2>
      <label>
        CEP
        <input value={formatCEP(form.cep)} onChange={(event) => onChange("cep", event.target.value)} onBlur={handleCepBlur} inputMode="numeric" autoComplete="postal-code" />
      </label>
      <label>
        Endereço
        <input value={form.endereco} onChange={(event) => onChange("endereco", event.target.value)} autoComplete="address-line1" />
      </label>
      <label>
        Número
        <input value={form.numero} onChange={(event) => onChange("numero", event.target.value)} />
      </label>
      <label>
        Complemento
        <input value={form.complemento} onChange={(event) => onChange("complemento", event.target.value)} />
      </label>
      <label>
        Bairro
        <input value={form.bairro} onChange={(event) => onChange("bairro", event.target.value)} />
      </label>
      <label>
        Cidade
        <input value={form.cidade} onChange={(event) => onChange("cidade", event.target.value)} />
      </label>
      <label>
        Estado
        <input value={form.estado} onChange={(event) => onChange("estado", event.target.value)} maxLength={2} />
      </label>
    </>
  );
}
