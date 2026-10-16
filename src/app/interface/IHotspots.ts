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
    created_at?: Date | null;
    updated_at?: Date | null;
}