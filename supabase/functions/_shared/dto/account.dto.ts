export interface AccountDto {
    id: number;
    dni: string;
    name: string;
    address: string;
    owner_id: string;
    active_from: Date;
    active_until: Date;
    status: string;
}