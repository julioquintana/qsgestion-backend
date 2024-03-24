import {SupabaseClient} from "../../../_shared/index.ts";
import {AuthResponse, AuthTokenResponsePassword} from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/types.d.ts";
import { SignUpUserDto } from "../dto/signup-user.dto.ts";

export async function signIn(supabase: SupabaseClient, email: string, password: string): Promise<AuthTokenResponsePassword | Response> {
    console.log('Signing in user:', email, password)
    const user: AuthTokenResponsePassword = await supabase.auth.signInWithPassword({email, password});
    console.log('User:', user);

    if (user.error) {
        console.error('Error signing user:', email);
        return new Response(JSON.stringify({status: 'ERROsR', message: user.error.message,}),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 401,
            });
    }
    return user as AuthTokenResponsePassword;
}

export async function signUp(supabase: SupabaseClient, email: string, password: string)  {
    try {
        const response: AuthResponse = await supabase.auth.signUp({email, password});
        return response.data.user;
    } catch (error) {
        throw new Error(error.message);
    }
}