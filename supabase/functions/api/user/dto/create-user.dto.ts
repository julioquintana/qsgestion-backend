import { Metadatum } from "../../../_shared/dto/user-response.dto.ts";
import { UserDto } from "../../../_shared/dto/user.dto.ts";

export  interface CreateUserDto {
    user: UserDto;
    metadata: Metadatum[];
    roles: string[];
}