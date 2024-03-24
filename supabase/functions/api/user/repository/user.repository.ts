import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {AccountResponse, UserResponse} from "../../../_shared/dto/user-response.dto.ts";
import {RolesDto} from "../../auth/dto/roles.dto.ts";
import {MetadataDto} from "../dto/metadata.dto.ts";

export async function getUserByEmailRepository(supabase: SupabaseClient, email: string): Promise<UserResponse> {
    const {data, error} = await supabase
        .from('users')
        .select('email, accounts(id,dni,name,address,owner_id,active_from,active_until,status,roles(key),metadata(key,value)) last_sign_in_at')
        .eq('email', email);
    if (error) {
        console.log(error.hint)
        console.log(error.message)
        throw error
    }
    if (!data || data.length === 0) {
        return;
    }

    return buildUserResponseList(data)[0];
}

export async function getAllUserRepository(supabase: SupabaseClient, accountId: string) {
    const {data, error} = await supabase
        .from('users')
        .select('id, email, user_info(*), user_account(accounts(*),roles(*),metadata(*)))')
        .eq("user_account.account_id", accountId)
    if (error) {
        console.log(JSON.stringify(error))
        throw error
    }
    if (!data || data.length === 0) {
        return [];
    }

    return buildUserResponseList(data);
}

export async function getUserByParameters(supabase: SupabaseClient, accountId: string, searchParams: any) {
    let query = supabase
        .from('users')
        .select('id, email, user_info(*), user_account(accounts(*),roles(*),metadata(*)))')
        .eq("user_account.account_id", accountId)

    for (const param in searchParams) {
        if (searchParams[param]) {
            query = query.ilike(param, `%${searchParams[param]}%`);
        }
    }

    const {data, error} = await query;
        console.log(JSON.stringify(data))
    if (error) {
        console.log(JSON.stringify(error))
        throw error
    }
    if (!data || data.length === 0) {
        return [];
    }

    return buildUserResponseList(data);
}


export async function getUsersByUserIdAndAccountsRepository(supabase: SupabaseClient, accountId: number[], userId: string) {
    const {data, error} = await supabase
        .from('users')
        .select('id, email, user_info(*), user_account(accounts(*),roles(*),metadata(*)))')
        .eq("user_account.account_id", accountId)
        .eq('id', userId)
    if (error) {
        console.log(error.hint)
        console.log(error.message)
        throw error
    }
    if (!data || data.length === 0) {
        return [];
    }

    return buildUserResponseList(data);
}

export async function getUserRecordByEmailRepository(supabase: SupabaseClient, email: string) {
    const {data, error} = await supabase
        .from('users')
        .select()
        .eq('email', email)

    if (error) {
        console.log('hint: ', error.hint)
        console.log('error: ', error)
        throw error
    }
    if (!data || data.length === 0) {
        return;
    }
    return data[0];
}

export async function createRoles(supabase: SupabaseClient, rolesDto: RolesDto[]): Promise<RolesDto> {
    const {data, error} = await supabase
        .from('roles')
        .upsert(rolesDto)
        .select();

    if (error) {
        console.error('Error updating user info:', error);
        throw error;
    }
    return data[0] as RolesDto;
}

export async function deleteAllRolesByUserIdAndAccount(supabase: SupabaseClient, userId: string, accountId: string) {
    const {error} = await supabase
        .from('roles')
        .delete()
        .eq('user_id', userId)
        .eq('account_id', accountId)

    if (error) {
        console.error('Error deleting roles info:', error);
    }
}
function buildUserResponseList(data: any) {
    return data.map(user => {
        return {
            id: user.id,
            dni: user.user_info[0].dni,
            name: user.user_info[0].name,
            email: user.email,
            accounts: user.user_account.map(accountData => {
                const roles: string[] = accountData.roles.map(role => role.key);
                const metadata: MetadataDto[] = accountData.metadata.map(metadatum => ({
                    key: metadatum.key,
                    value: metadatum.value
                }));
                return new AccountResponse(
                    accountData.accounts.id,
                    accountData.accounts.dni,
                    accountData.accounts.name,
                    roles,
                    accountData.accounts.status,
                    accountData.accounts.address,
                    metadata,
                    accountData.accounts.owner_id,
                    new Date(accountData.accounts.active_from),
                    new Date(accountData.accounts.active_until),
                    accountData.accounts.token
                );
            })
        }
    }) as UserResponse[];
}