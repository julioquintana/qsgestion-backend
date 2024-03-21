import {getAllUsers, searchUsers, upsertUser} from "./user/service/users.service.ts";
import {createAccount} from "./account/service/account.services.ts";
import {corsHeaders, supabase} from "../_shared/index.ts";
import {loginUser} from "./auth/service/auth.services.ts";
import {UserDto} from "../_shared/dto/user.dto.ts";
import {validateAppAuthorizationMiddleware} from "../_shared/security/index.ts";


Deno.serve(async (req: Request) => {
    const {url, method} = req
    if (method === 'OPTIONS') {
        return new Response('ok', {headers: corsHeaders})
    }

    try {
        const supabaseClient = supabase(req);

        // Define URL patterns for login and logout
        const loginPattern = new URLPattern({pathname: '/api/auth/login'});
        const logoutPattern = new URLPattern({pathname: '/api/auth/logout'});
        const createAccountPattern = new URLPattern({pathname: '/api/account'});
        const userPattern = new URLPattern({pathname: '/api/user'});

        // Check if the request URL matches any of the patterns
        const isLogin = loginPattern.test(url);
        const isLogout = logoutPattern.test(url);
        const isCreateAccount = createAccountPattern.test(url);
        const isUserRoute = userPattern.test(url);
        const searchUserPattern = new URLPattern({pathname: '/api/user/search'});

        // call relevant method based on method and id
        switch (true) {
            case isLogin && method === 'POST': {
                const credential: UserDto = await req.json()
                return loginUser(supabaseClient, credential.email, credential.password)
            }
            case isLogout && method === 'POST': {
                // Handle logout
                break;
            }
            case isCreateAccount && method === 'POST': {
                return createAccount(supabaseClient, req)
            }
            case isUserRoute && method === 'GET': {
                const authResponse = validateAppAuthorizationMiddleware(req, ["owner", "admin"])
                if (authResponse) {
                    return authResponse;
                }
                return await getAllUsers(supabaseClient, req);
            }
            case searchUserPattern.test(url) && method === 'GET': {
                const authResponse = validateAppAuthorizationMiddleware(req, [])
                if (authResponse) {
                    return authResponse;
                }
                return await searchUsers(supabaseClient, req);
            }
            case isUserRoute && method === 'POST': {
                const authResponse = validateAppAuthorizationMiddleware(req, ["owner", "admin"])
                if (authResponse) {
                    return authResponse;
                }
                return await upsertUser(supabaseClient, req);
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


