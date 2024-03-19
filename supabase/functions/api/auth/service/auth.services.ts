import {SupabaseClient} from "../../../_shared/index.ts";
import {ErrorDto} from "../../../_shared/dto/error.dto.ts";
import {buildToken} from "../../../_shared/security/index.ts";
import {UserAdditionalInfo} from "../../../_shared/dto/user-additional-info.dto.ts";
import {RolesDto} from "../dto/roles.dto.ts";

async function signUp(supabase: SupabaseClient, email: string, password: string): Promise<any> {
    try {
        const response = await supabase.auth.signUp({email, password});
        if (response.error) {
            console.error('Error creating user:', response);
            return response;
        }
        return response.data;
    } catch
        (error) {
        console.error('Error signing up:', error);
        return {error: 'Error signing up.', message: error.message, status: "1234"} as ErrorDto;
    }
}

async function signIn(supabase: SupabaseClient, email: string, password: string) {
    try {
        console.log('login to email:', email)
        const user = await supabase.auth.signInWithPassword({email, password});
        if (user.error) {
            console.error('Error signing user:', email);
            return new Response(JSON.stringify({status: 'ERROR', message: user.error.message,}),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    status: 401,
                });
        }
        
        const {data} = await supabase
            .from('user_additional_info')
            .select('*')
            .eq('user_id', user.data.user.id);
        const userAdditionalInfoSalved:UserAdditionalInfo = data![0];
        
        const account = await supabase.
        from('accounts')
            .select('*')
            .eq('id', userAdditionalInfoSalved.account_id);
        
        const tokenInfo: UserAdditionalInfo = {
            user_id: userAdditionalInfoSalved.user_id!,
            active_from: account.data![0].active_from,
            active_until: account.data![0].active_until,
            roles: userAdditionalInfoSalved.roles,
            account_id: userAdditionalInfoSalved.account_id
        }
        const response = {message: 'Signed in', user: user.data.user.email}
        console.log(response)
        return new Response(
            JSON.stringify(response),
            {
                headers: {
                    "Content-Type": "application/json",
                    "AuthorizationApp": `Bearer  ${buildToken(tokenInfo)}`
                },
            }
        );
    } catch
        (error) {
        console.error('Error signing up:', error);
        return {error: 'Error signing up.', message: error.message, status: "1234"} as ErrorDto;
    }
}
async function createRoles(supabase: SupabaseClient, rolesDto: RolesDto) {

    const {data, error} = await supabase
        .from('roles')
        .upsert(rolesDto).select()

    if (error) {
        console.error('Error updating user info:', error);
    } else {
        console.log('User info updated:', data);
    }
    console.log('User additional info salved:', data);
    return data;
}
export {signUp, signIn, createRoles};