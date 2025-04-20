import IProvider from "./IProviders";

export interface IHotspot {
    id?: number;
    nome?: string;
    endereco?: string;
    numero?: string;
    cidade?: string;
    bairro?: string;
    complemento?: string;
    cep?: string;
    status?: string;
    isp?: IProvider;
    slug?: string;
    created_at?: Date | null;
    updated_at?: Date | null;
}