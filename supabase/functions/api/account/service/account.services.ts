import {UserDto} from "../../../_shared/dto/user.dto.ts";
import {Account} from "../../../_shared/dto/account.dto.ts";
import {SupabaseClient} from "https://esm.sh/@supabase/supabase-js@2.39.8";
import {createRoles, signUp} from "../../auth/service/auth.services.ts";
import {SignUpUserDto} from "../../auth/dto/signup-user.dto.ts";
import {createAdditionalUserInfo} from "../../user/service/users.service.ts";
import {buildToken} from "../../../_shared/security/index.ts";
import {UserAdditionalInfo} from "../../../_shared/dto/user-additional-info.dto.ts";
import {TokenInfoDto} from "../../../_shared/dto/token-info.dto.ts";
import {RolesDto} from "../../auth/dto/roles.dto.ts";

const generateAdditionalForQSGestion = (user: UserDto, accountId: number) => {
    return [
        {user_id: user.id, key: "NAME", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId},
        {user_id: user.id, key: "name", value: user.name, account_id: accountId}
    ] as UserAdditionalInfo[]
};

export async function createAccount(supabase: SupabaseClient, request: Request): Promise<Response> {
    try {
        const requestBody = await request.json();
        console.log('Request body:', JSON.stringify(requestBody));
        const account: Account = requestBody.account;
        const accountExist: any = await getAccountByDni(supabase, account.dni);
        if (accountExist.length > 0) {
            console.log('Account data error:', accountExist.error);
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

        const user: UserDto = requestBody.user;
        const userData: SignUpUserDto = await signUp(supabase, user.email, user.password);
        if (userData.error) {
            return new Response(JSON.stringify({status: 'ERROR', message: userData.error}),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 500,
                });


        }
        const userId = userData.user?.id ?? "";
        const currentDate = new Date(new Date().toISOString());
        const futureDate = new Date(new Date().toISOString());
        futureDate.setDate(currentDate.getDate() + 15);

        const accountData: Account = {
            owner_id: userId,
            dni: account.dni,
            name: account.name,
            address: account.address,
            status: 'active',
            active_from: currentDate,
            active_until: futureDate
        }

        const {data} = await supabase
            .from('accounts')
            .insert(accountData).select();

        user.id = userId;
        const additionalIndoDataForQSGestion: UserAdditionalInfo[] = generateAdditionalForQSGestion(user, data![0].id);
        const userSalved: UserAdditionalInfo[] | null = await createAdditionalUserInfo(supabase, additionalIndoDataForQSGestion);

        const roles: RolesDto = {user_id: userId, roles: ["owner"], account_id: data![0].id}
        const rolesSalved: RolesDto[] | null = await createRoles(supabase, roles);


        const tokenInfo = userSalved![0] as TokenInfoDto;
        tokenInfo.roles = rolesSalved![0].roles;
        tokenInfo.active_from = currentDate
        tokenInfo.active_until = futureDate
        return new Response(JSON.stringify({message: 'User Created', user_id: userData.user?.id}),
            {
                headers: {
                    "Content-Type": "application/json",
                    "AuthorizationApp": `Bearer  ${buildToken(tokenInfo)}`
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

export async function getAccountByDni(supabase: SupabaseClient, dni: string) {
    const {data} = await supabase
        .from('accounts')
        .select('*')
        .eq('dni', dni);
    return data;
}

/*
const userCreated = response.data!.user!.id!.toString();


export async function blockAccount(accountId) {
    const {data, error} = await supabase
        .from('accounts')
        .update({status: 'blocked'})
        .eq('id', accountId);

    if (error) {
        console.error('Error blocking account:', error);
        return null;
    }

    return data;
}

export async function getAccounts() {
    const {data, error} = await supabase
        .from('accounts')
        .select('*');

    if (error) {
        console.error('Error getting accounts:', error);
        return null;
    }

    return data;
}

export async function getAccountById(accountId) {
    const {data, error} = await supabase
        .from('accounts')
        .select('*')
        .eq('id', accountId);

    if (error) {
        console.error('Error getting account:', error);
        return null;
    }

    return data;
}

export async function updateAccount(accountId, accountUpdates) {
    const {data, error} = await supabase
        .from('accounts')
        .update(accountUpdates)
        .eq('id', accountId);

    if (error) {
        console.error('Error updating account:', error);
        return null;
    }

    return data;
}*/
