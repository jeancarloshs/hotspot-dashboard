export interface IServerMK {
  server: IServer;
  user: IUser[];
}

export interface IServer {
  user: IUser[];  // array de usuários, pois você está acessando `user![0]`
  id?: string | number;
  server?: string;
  address?: string;
  mac_address?: string;
  login_by?: string;
  uptime?: string;
  session_time_left?: string;
  idle_time?: string;
  keepalive_timeout?: string;
  bytes_in?: string;
  bytes_out?: string;
  packets_in?: string;
  packets_out?: string;
  radius?: string;
  hsID?: IHotspot;  // Aqui parece que você está acessando `hotspot.nome`, então, deve ser `hsID` para manter a consistência
  hotspot?: IHotspot;
  created_at?: Date;
}

export interface IUser {
  id: number;
  nome_completo?: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
  email?: string;
  password?: string;
  cep?: string;
  endereco?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  complemento?: string;
  tipo_usuario?: string;
  ip_local?: string;
  hotspot?: IHotspot;
  created_at?: Date;
  updated_at?: Date;
}

export interface IHotspot {
  id?: number;
  nome?: string;
}
