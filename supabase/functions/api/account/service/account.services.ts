import {UserDto} from "../../../_shared/dto/user.dto.ts";
import {SupabaseClient} from "https://esm.sh/@supabase/supabase-js@2.39.8";
import {buildToken} from "../../../_shared/security/index.ts";
import {MetadataDto} from "../../user/dto/metadata.dto.ts";
import {TokenInfoDto} from "../../../_shared/dto/token-info.dto.ts";
import {RolesDto} from "../../auth/dto/roles.dto.ts";
import {createRoles, getUserRecordByEmailRepository} from "../../user/repository/user.repository.ts";
import {AccountDto} from "../../../_shared/dto/account.dto.ts";
import {createUserAccountRepository} from "../../user/repository/user-account.repository.ts";
import {createAccountRepository, getAccountByDni} from "../repository/account.repositoty.ts";
import {signUp} from "../../auth/repository/auth.repository.ts";
import {createMetadata} from "../../user/repository/metadata.repository.ts";
import {User} from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/types.d.ts";
import {UserAccountDto} from "../../user/dto/user-account.dto.ts";
import {AccountResponse, UserResponse} from "../../../_shared/dto/user-response.dto.ts";
import {createUserInfoRepository} from "../../user/repository/user-info.repository.ts";
import {UserInfoDto} from "../../user/dto/user-info.dto.ts";

const metadataForQSGestion = (user: UserDto, accountId: number) => {
    return [
        {user_id: user.id, key: "NAME", value: user.name, account_id: accountId}
    ] as MetadataDto[]
};

export async function createAccount(supabase: SupabaseClient, request: Request): Promise<Response> {
    try {
        const requestBody = await request.json();
        console.log('Request body:', JSON.stringify(requestBody));

        const account: AccountDto = requestBody.account;
        const userDto: UserDto = requestBody.user;

        console.log('Searching  Account:', JSON.stringify(account))
        let accountDto: AccountDto = await getAccountByDni(supabase, account.dni);

        if (accountDto != null) {
            return new Response(JSON.stringify({
                    status: 'ERROR', message: {
                        name: "AccountApiError",
                        message: "Account already registered",
                        status: 400
                    }
                }),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 400,
                });

        }
        const currentDate = new Date(new Date().toISOString());
        const futureDate = new Date(new Date().toISOString());
        futureDate.setDate(currentDate.getDate() + 15);
        const accountData = {
          dni: account.dni,
          name: account.name,
          address: account.address,
          status: 'active',
          active_from: currentDate,
          active_until: futureDate
        }
        const userDB = await getUserRecordByEmailRepository(supabase, userDto.email);

        if (userDB) {
            userDto.id = userDB.id;
            accountData.owner_id = userDto.id;
            console.log('User Found:', userDB.id)
        } else {
            const userCreated: User = await signUp(supabase, userDto.email, userDto.password);
            console.log('Created new user:', JSON.stringify(userCreated))
            accountData.owner_id = userCreated.id;
            userDto.id = userCreated.id;
        }
        accountDto = await createAccountRepository(supabase, accountData);
        console.log('Created account:', JSON.stringify(accountDto))
        const userAccountDto: UserAccountDto = {user_id: userDto.id, account_id: accountDto.id};
        const userAccount: UserAccountDto = await createUserAccountRepository(supabase, userAccountDto);
        console.log('Created User-Account', JSON.stringify(userAccount));

        const roles: RolesDto = {user_id: userDto.id, key: "OWNER", account_id: accountDto.id}
        const rolesSalved: RolesDto | null = await createRoles(supabase, [roles]);
        console.log('Created user roles:', JSON.stringify(rolesSalved))
        
        const userInfo: UserInfoDto = {user_id: userDto.id, dni: userDto.dni, name: userDto.name};
        const userInfoSalved: UserInfoDto | null = await createUserInfoRepository(supabase, userInfo);
        console.log('Created user info:', JSON.stringify(userInfoSalved))
        

        const tokenInfo: TokenInfoDto = {
            user_id: userDto.id,
            roles: [rolesSalved.key],
            account_id: accountDto.id,
            active_from: currentDate,
            active_until: futureDate
        };
        const token = buildToken(tokenInfo)
        const accountResponse: AccountResponse = accountDto as AccountResponse;
        accountResponse.roles = [rolesSalved.key];
        accountResponse.token = token;
        const userCreated: UserResponse = {
            email: userDto.email,
            accounts: [accountResponse],
        }


        return new Response(JSON.stringify({message: 'User and Account Created', payload: userCreated}),
            {
                headers: {
                    "Content-Type": "application/json",
                    "AuthorizationApp": `Bearer  ${token}`
                },
                status: 200,
            });
    } catch (error) {
        console.error('Error creating account:', error);
        return new Response(JSON.stringify({status: 'ERROR', message: error}),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 500,
            });
    }
}
