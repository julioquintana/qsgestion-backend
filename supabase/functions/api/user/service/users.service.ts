import SupabaseClient from "https://esm.sh/v135/@supabase/supabase-js@2.39.8/dist/module/SupabaseClient.d.ts";
import {corsHeaders} from "../../../_shared/index.ts";
import {createRoles, getAllUserRepository, getUserRecordByEmailRepository, getUsersByUserIdAndAccountsRepository} from "../repository/user.repository.ts";
import {getPayloadToken} from "../../../_shared/security/index.ts";
import {User} from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/types.d.ts";
import {signUp} from "../../auth/repository/auth.repository.ts";
import {CreateUserDto} from "../dto/create-user.dto.ts";
import {UserAccountDto} from "../dto/user-account.dto.ts";
import {createUserAccountRepository} from "../repository/user-account.repository.ts";
import {createMetadata} from "../repository/metadata.repository.ts";
import {MetadataDto} from "../dto/metadata.dto.ts";
import {RolesDto} from "../../auth/dto/roles.dto.ts";


async function getAllUsers(supabase: SupabaseClient, req: Request) {
    const accountId = getPayloadToken(req).account_id;
    await supabase.auth.getUser()

    return new Response(JSON.stringify(await getAllUserRepository(supabase, accountId)), {
        headers: {...corsHeaders, 'Content-Type': 'application/json'},
        status: 200,
    })
}


async function upsertUser(supabase: SupabaseClient, req: Request) {
    try {
        const requestBody: CreateUserDto = await req.json();

        const accountId = getPayloadToken(req).account_id;

        const userDB = await getUserRecordByEmailRepository(supabase, requestBody.user.email);
        let userId = "";
        if (userDB) {
            userId = userDB.id;
        } else {
            const userCreated: User  = await signUp(supabase, requestBody.user.email, requestBody.user.password);
            userId = userCreated.id;
        }

        const userAccountDto: UserAccountDto = {user_id: userId, account_id: accountId};
        const userAccount: UserAccountDto = await createUserAccountRepository(supabase, userAccountDto);
        console.log('Created User-Account', JSON.stringify(userAccount));

        const metadata = await createMetadata(supabase, setUserAndAccountIdToMetadata(userId, accountId, requestBody.metadata));
        console.log('Created Metadata:', JSON.stringify(metadata))

        const rolesSalved: RolesDto | null = await createRoles(supabase, buildRolesDto(requestBody.roles, userId, accountId));
        console.log('Created user roles:', JSON.stringify(rolesSalved))

        const userCreated = await getUsersByUserIdAndAccountsRepository(supabase, [accountId], userId);
        return new Response(JSON.stringify({message: 'UserAccount Created', payload: userCreated[0]}),
            {
                headers: {
                    "Content-Type": "application/json"
                },
                status: 200,
            });
    } catch
        (error) {
        console.error('Error creating account:', error);
        return new Response(JSON.stringify({status: 'ERROR', message: error}),
            {
                headers: {
                    "Content-Type": "application/json",
                },
                status: 500,
            });
    }
}

function buildRolesDto(roles: string[], user_id: string, account_id: number) {
    return roles.map((role) => {
        return {user_id: user_id, account_id: account_id, key: role} as RolesDto;
    });
}

function setUserAndAccountIdToMetadata(user_id: string, account_id: number, metadata: MetadataDto[]) {
    metadata.forEach((m) => {
        m.user_id = user_id;
        m.account_id = account_id;
    });
    return metadata;

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


export {userExist, upsertUser, getAllUsers};
