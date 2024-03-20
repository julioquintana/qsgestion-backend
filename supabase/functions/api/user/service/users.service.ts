import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {corsHeaders} from "../../../_shared/index.ts";
import {getValueToken} from "../../../_shared/security/index.ts";
import {getAllUserRepository} from "../repository/user.repository.ts";

async function getAllUsers(supabase: SupabaseClient, req: Request) {
    //TODO: We need  search additional info for each user and mapper to structure to response
    const authHeader = req.headers.get('app-authorization');
    const tokenParts = authHeader!.split(' ');
    const accountId = (getValueToken(tokenParts[1])).account_id
    await supabase.auth.getUser()
    console.log(accountId)

    const response = getAllUserRepository(supabase, accountId);


    return new Response(JSON.stringify(response), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
        status: 200,
    })
}


async function updateUserInfo(supabase: SupabaseClient, user_id: string, company: string, roles: string, token: string) {

    await supabase.auth.getUser()


    const {data, error} = await supabase
        .from('user_additional_info')
        .update({company: company, roles: roles})
        .eq('user_id', user_id);

    if (error) {
        console.error('Error updating user info:', error);
    } else {
        console.log('User info updated:', data);
    }
}

async function userExist(supabase: SupabaseClient, email: string) {
    const {data, error} = await supabase
        .from('auth.users')
        .select()
        .eq('email', email);

    if (error) {
        console.error('Error checking if user exists:', error);
        return false;
    }
    return data.length > 0;
}


export {userExist, updateUserInfo, getAllUsers};
