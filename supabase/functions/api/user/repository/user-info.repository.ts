import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import { UserInfoDto } from "../dto/user-info.dto.ts";

export async function createUserInfoRepository(supabase: SupabaseClient, userInfoDto: UserInfoDto): Promise<UserInfoDto> {

    const {data, error} = await supabase
        .from('user_info')
        .upsert(userInfoDto).select()

    if (error) {
        console.error('Error salving user-info:', error);
        throw error;
    }
    return data[0] as UserInfoDto;
}

export async function deleteAllUserInfoByUserId(supabase: SupabaseClient, userId: string) {
    const {error} = await supabase
        .from('user_info')
        .delete()
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting User Info info:', error);
    }
}