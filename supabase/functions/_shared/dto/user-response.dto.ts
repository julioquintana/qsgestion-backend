export interface UserResponseDto {
    user_id: string;
    email: string;
    roles: string[]; //additional info
    account: { //account
        id: number;
        dni: string;
        name: string;
        address: string;
        owner_id: string;
        active_from: Date;
        active_until: Date;
        status: string;
    }
}
