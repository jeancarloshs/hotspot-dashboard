export default interface IProvider {
  id?: number;
  nome?: string;
  cnpj?: string;
  razao_social?: string;
  endereco?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  site?: string;
  numero?: string;
  complemento?: string;
  cidade?: string;
  bairro?: string;
  cep?: string;
  estado?: string;
  slug?: string;
  status?: string;
  token?: string;
  created_at?: Date | null;
  updated_at?: Date | null;
}