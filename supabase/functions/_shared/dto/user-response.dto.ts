export interface UserResponse {
    email: string;
    dni: string;
    name: string;
    accounts: AccountResponse[];
}

export class AccountResponse {
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

    constructor(id: number, dni: string, name: string, roles: string[], status: string, address: string, metadata: Metadatum[], owner_id: string, active_from: Date, active_until: Date, token: string) {
        this.id = id;
        this.dni = dni;
        this.name = name;
        this.roles = roles;
        this.status = status;
        this.address = address;
        this.metadata = metadata;
        this.owner_id = owner_id;
        this.active_from = active_from;
        this.active_until = active_until;
        this.token = token;
    }
}

export interface Metadatum {
    key: string;
    value: string;
}
