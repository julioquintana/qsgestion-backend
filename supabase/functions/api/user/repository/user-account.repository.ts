import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {UserResponse} from "../../../_shared/dto/user-response.dto.ts";
import {UserAccountDto} from "../dto/user-account.dto.ts";

export async function getUserAccountByUserIdRepository(supabase: SupabaseClient, userId: string, accountId: string): Promise<UserResponse> {
    const {data, error} = await supabase
        .from('user-account')
        .select()
        .eq('user_id', userId)
        .eq('account_id', accountId)
        .single();
    if (error) {
        console.log(error.hint)
        console.log(error.message)
        throw error
    }
    if (!data || data.length === 0) {
        return;
    }

    return  data as UserAccountDto;
}


export async function createUserAccountRepository(supabase: SupabaseClient, userAccountDto: UserAccountDto) {

    const {data, error} = await supabase
        .from('user_account')
        .insert(userAccountDto)
        .select();

    if (error) {
        console.error('Error salving user-account info:', error);
        throw error;
    } 
    return data[0];
}