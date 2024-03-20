import {SupabaseClient} from "../../../_shared/index.ts";
import {ErrorDto} from "../../../_shared/dto/error.dto.ts";
import {buildToken} from "../../../_shared/security/index.ts";
import {TokenInfoDto} from "../../../_shared/dto/token-info.dto.ts";
import {getUsersByUserIdAndAccountsRepository} from "../../user/repository/user.repository.ts";
import {AuthTokenResponsePassword} from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/types.d.ts";
import { signIn } from "../repository/auth.repository.ts";


export async function loginUser(supabase: SupabaseClient, email: string, password: string) {
  try {
    console.log('login to email:', email)
    const user: AuthTokenResponsePassword = await signIn(supabase, email, password);
    
    const {data} = await supabase
    .from('metadata')
    .select('account_id')
    .eq('user_id', user.data.user!.id);

    const distinctAccountIds = [...new Set(data.map(item => item.account_id))];

    const usersFound = await getUsersByUserIdAndAccountsRepository(supabase, distinctAccountIds, user.data.user.id)

    for (let index = 0; index < usersFound[0].accounts.length; index++) {
      const account = usersFound[0].accounts[index];
      console.log('Account found:', account)

      const tokenInfo: TokenInfoDto = {
        user_id: user.data.user!.id,
        roles: account.roles,
        account_id: account.id,
        active_from: account.active_from,
        active_until: account.active_until,
      }

      usersFound[0].accounts[index].token = buildToken(tokenInfo)
    }
    const response = {message: 'Signed in', user: user.data.user!.email}
    return new Response(
        JSON.stringify(usersFound[0]),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
    );
  } catch
      (error) {
    console.error('Error signing up:', error);
    return {error: 'Error signing up.', message: error.message, status: "1234"} as ErrorDto;
  }
}
