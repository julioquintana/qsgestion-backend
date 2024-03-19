import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {corsHeaders} from "../../../_shared/index.ts";
import {UserAdditionalInfo} from "../../../_shared/dto/user-additional-info.dto.ts";
import {getValueToken} from "../../../_shared/security/index.ts";

async function getAllUsers(supabase: SupabaseClient, req: Request) {
    //TODO: We need  search additional info for each user and mapper to structure to response
    const authHeader = req.headers.get('app-authorization');
    const tokenParts = authHeader!.split(' ');
    const accountId =( getValueToken(tokenParts[1])).account_id
    await supabase.auth.getUser()
console.log(accountId)

    const {data, error} = await supabase
        .from('users')
        .select('email, accounts(id,dni,name,address,owner_id,active_from,active_until,status,roles(key)),last_sign_in_at')
      //  .eq("accounts.id", accountId)
    if (error) {
        console.log(error.hint)
        throw error
    }

    return new Response(JSON.stringify({users:data}), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
        status: 200,
    })
}


async function createAdditionalUserInfo(supabase: SupabaseClient, additionalInfo: UserAdditionalInfo[]) {

    const {data, error} = await supabase
        .from('user_additional_info')
        .insert(additionalInfo).select()

    if (error) {
        console.error('Error updating user info:', error);
    } else {
        console.log('User info updated:', data);
    }
    console.log('User additional info salved:', data);
    return data;
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

async function getUserInfo(supabase: SupabaseClient, user_id: string) {
    const {data, error} = await supabase
        .from('user_additional_info')
        .select('company, roles')
        .eq('user_id', user_id);

    if (error) {
        console.error('Error getting user info:', error);
    } else {
        console.log('User info:', data);
    }
}


export {userExist, createAdditionalUserInfo, updateUserInfo, getUserInfo, getAllUsers};
