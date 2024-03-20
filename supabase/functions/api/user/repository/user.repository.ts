import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {UserResponse} from "../../../_shared/dto/user-response.dto.ts";
import {RolesDto} from "../../auth/dto/roles.dto.ts";

export async function getUserByEmailRepository(supabase: SupabaseClient, email: string): Promise<UserResponse> {
    const {data, error} = await supabase
        .from('users')
        .select('email, accounts(id,dni,name,address,owner_id,active_from,active_until,status,roles(key),metadata(key,value)) last_sign_in_at')
        .eq('email', email)
        .single();
    if (error) {
        console.log(error.hint)
        console.log(error.message)
        throw error
    }
    if (!data || data.length === 0) {
        return;
    }

    console.log('Users:', data)
    return data.accounts.map(account => {
        return {
            ...account,
            roles: account.roles.map(role => role.key)
        }
    }) as UserResponse;
}

export async function getAllUserRepository(supabase: SupabaseClient, accountId: string) {
    const {data, error} = await supabase
        .from('users')
        .select('email, accounts(id,dni,name,address,owner_id,active_from,active_until,status,roles(key),metadata(key,value)) last_sign_in_at')
        .eq("accounts.id", accountId)
    console.log(data)
    if (error) {
        console.log(error.hint)
        console.log(error.message)
        throw error
    }
    if (!data || data.length === 0) {
        return [];
    }
    const transformedData = data.map(user => {
        return {
            ...user,
            accounts: user.accounts.map(account => {
                return {
                    ...account,
                    roles: account.roles.map(role => role.key)
                }
            })
        }
    }) as UserResponse[];

    return transformedData;
}

export async function getUsersByUserIdAndAccountsRepository(supabase: SupabaseClient, accountId: string[], userId: string) {
    const {data, error} = await supabase
        .from('users')
        .select('email, accounts(id,dni,name,address,owner_id,active_from,active_until,status,roles(key),metadata(key,value)) last_sign_in_at')
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
    return data.map(user => {
        return {
            ...user,
            accounts: user.accounts.map(account => {
                return {
                    ...account,
                    roles: account.roles.map(role => role.key)
                }
            })
        }
    }) as UserResponse[];
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