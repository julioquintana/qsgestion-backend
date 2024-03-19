import {getAllUsers} from "./user/service/users.service.ts";
import {createAccount} from "./account/service/account.services.ts";
import {corsHeaders, supabase} from "../_shared/index.ts";
import {signIn} from "./auth/service/auth.services.ts";
import {UserDto} from "../_shared/dto/user.dto.ts";
import { validateAppAuthorization } from "../_shared/security/index.ts";


Deno.serve(async (req: Request) => {
    const {url, method} = req
    if (method === 'OPTIONS') {
        return new Response('ok', {headers: corsHeaders})
    }

    try {
        const supabaseClient = supabase(req);

        // Define URL patterns for login and logout
        const loginPattern = new URLPattern({pathname: '/backend/auth/login'});
        const logoutPattern = new URLPattern({pathname: '/backend/auth/logout'});
        const createAccountPattern = new URLPattern({pathname: '/backend/account'});
        const allUserPattern = new URLPattern({pathname: '/backend/user'});

        // Check if the request URL matches any of the patterns
        const isLogin = loginPattern.test(url);
        const isLogout = logoutPattern.test(url);
        const isCreateAccount = createAccountPattern.test(url);
        const isAllUser = allUserPattern.test(url);

        // call relevant method based on method and id
        switch (true) {
            case isLogin && method === 'POST': {
                const credential: UserDto = await req.json()
                return signIn(supabaseClient, credential.email, credential.password)
            }
            case isLogout && method === 'POST': {
                // Handle logout
                break;
            }
            case isCreateAccount && method === 'POST': {
                return createAccount(supabaseClient, req)
            }
            case isAllUser && method === 'GET': {
                const authResponse = validateAppAuthorization(req);
                if (authResponse) {
                    return authResponse;
                }
                return await getAllUsers(supabaseClient);
            }
        }
        throw new Error("Invalid Request ")
    } catch (error) {
        console.error(error)

        return new Response(JSON.stringify({error: error.message}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 400,
        })
    }
})


