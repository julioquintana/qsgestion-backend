import { Account } from "./account.dto.ts";
import { UserDto } from "./user.dto.ts";

export interface CreateAccountDto {
    account: Account;
    user: UserDto;
}