import IProvider from "./IProviders";

export interface IHotspot {
    id?: number;
    nome?: string;
    endereco?: string;
    numero?: string;
    cidade?: string;
    bairro?: string;
    estado?: string;
    complemento?: string;
    cep?: string;
    ip?: string;
    status?: string;
    isp?: IProvider;
    ispID?: number;
    slug?: string;
    mk_user?: string;
    mk_api_port?: number | null;
    mk_online?: boolean;
    mk_last_check?: Date | string | null;
    mk_last_error?: string | null;
    mk_uptime?: string | null;
    mk_version?: string | null;
    mk_cpu_load?: string | null;
    mk_free_memory_mb?: number | null;
    created_at?: Date | null;
    updated_at?: Date | null;
}