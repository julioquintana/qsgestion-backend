import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {UserResponse} from "../../../_shared/dto/user-response.dto.ts";
import {MetadataDto} from "../dto/metadata.dto.ts";

export async function getMetadataByUserIdAndAccountIdRepository(supabase: SupabaseClient, userId: string, accountId: string): Promise<UserResponse> {
    const {data, error} = await supabase
        .from('metadata')
        .select()
        .eq('user_id', userId)
        .eq('account_id', accountId);
    if (error) {
        console.log(error.hint)
        console.log(error.message)
        throw error
    }
    if (!data || data.length === 0) {
        return;
    }

    return  data as MetadataDto[];
}

export async function createMetadata(supabase: SupabaseClient, metadataDtos: MetadataDto[]) {

    const {data, error} = await supabase
        .from('metadata')
        .insert(metadataDtos).select()

    if (error) {
        console.error('Error saving metadata info:', error);
    } 
    return data;
}