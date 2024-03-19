import jwt from "npm:jsonwebtoken";
import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {corsHeaders} from "../../../_shared/index.ts";

async function getAllUsers(supabaseClient: SupabaseClient) {
    await supabaseClient.auth.getUser()
    const {data: users, error} = await supabaseClient.from('users').select('*')
    if (error) throw error

    return new Response(JSON.stringify({users}), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
        status: 200,
    })
}


async function createAdditionalUserInfo(supabase: SupabaseClient, newUser: string, account_id: string, roles: string[]) {

    const {data, error} = await supabase
        .from('user_additional_info')
        .insert({account_id: account_id, roles: roles, user_id: newUser}).select()

    if (error) {
        console.error('Error updating user info:', error);
    } else {
        console.log('User info updated:', data);
    }
    console.log('User additional info salved:', data);
    return data;
}

async function updateUserInfo(supabase: SupabaseClient, user_id: string, company: string, roles: string, token: string) {
    try {
        jwt.verify(token, 'your-secret-key');
    } catch (error) {
        console.error('Invalid token:', error);
        return;
    }

    //supabase.auth.setAuth(userToken);


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
