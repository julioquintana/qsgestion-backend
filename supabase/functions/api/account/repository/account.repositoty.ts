import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {AccountDto} from "../../../_shared/dto/account.dto.ts";

export async function createAccountRepository(supabase: SupabaseClient, account: AccountDto): Promise<AccountDto> {

    const {data, error} = await supabase
        .from('accounts')
        .insert(account).select()

    if (error) {
        console.error('Error updating Account info:', error);
    } 
    return data[0] as AccountDto;
}

export async function getAccountByDni(supabase: SupabaseClient, dni: string) {
    const {data} = await supabase
        .from('accounts')
        .select()
        .eq('dni', dni)
        .single();
    return data as AccountDto;
}


export async function getAccountByUserId(supabase: SupabaseClient, userId: string) {
    const {data} = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .single();
    return data;
}