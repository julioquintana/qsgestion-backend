export interface TokenInfoDto {
    user_id: string;
    roles: string[];
    account_id: number;
    active_from: Date;
    active_until: Date;
}
