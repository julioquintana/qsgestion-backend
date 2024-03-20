import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {AccountResponse, UserResponse} from "../../../_shared/dto/user-response.dto.ts";
import {RolesDto} from "../../auth/dto/roles.dto.ts";
import {GetResult} from "https://esm.sh/v135/@supabase/postgrest-js@1.8.6/dist/module/select-query-parser.d.ts";

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
        .select('email, accounts!accounts_owner_id_fkey(id,dni,name,address,owner_id,active_from,active_until,status,user_account(roles(key),metadata(key,value))) last_sign_in_at')
        .eq("accounts.id", accountId)
    console.log(JSON.stringify(data))
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

function buildUserResponseList(data: GetResult<any, any, any, unknown, "email, accounts!accounts_owner_id_fkey(id,dni,name,address,owner_id,active_from,active_until,status,user_account(roles(key),metadata(key,value))) last_sign_in_at">[]) {
    return data.map(user => {
        return {
            ...user,
            accounts: user.accounts.map(account => {
                const roles = account.user_account[0].roles.map(role => role.key);
                const metadata = account.user_account[0].metadata.map(metadatum => ({
                    key: metadatum.key,
                    value: metadatum.value
                }));
                return new AccountResponse(
                    account.id,
                    account.dni,
                    account.name,
                    roles,
                    account.status,
                    account.address,
                    metadata,
                    account.owner_id,
                    new Date(account.active_from),
                    new Date(account.active_until),
                    account.token
                );
            })
        }
    }) as UserResponse[];
}

export async function getUsersByUserIdAndAccountsRepository(supabase: SupabaseClient, accountId: number[], userId: string) {
    const {data, error} = await supabase
        .from('users')
        .select('email, accounts!accounts_owner_id_fkey(id,dni,name,address,owner_id,active_from,active_until,status,user_account(roles(key),metadata(key,value))) last_sign_in_at')
        .in("accounts.id", accountId)
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
    console.log('User:', data)
    if (!data || data.length === 0) {
        return;
    }
    return data[0];
}

export async function createRoles(supabase: SupabaseClient, rolesDto: RolesDto): Promise<RolesDto> {
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
