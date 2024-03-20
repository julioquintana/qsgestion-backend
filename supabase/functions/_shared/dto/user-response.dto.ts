export interface UserResponse {
  email: string;
  accounts: AccountResponse[];
}

export interface AccountResponse {
  id: number;
  dni: string;
  name: string;
  roles: string[];
  status: string;
  address: string;
  metadata: Metadatum[];
  owner_id: string;
  active_from: Date;
  active_until: Date;
  token: string;
}

export interface Metadatum {
  key: string;
  value: string;
}
