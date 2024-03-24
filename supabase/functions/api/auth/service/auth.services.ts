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
    const user: AuthTokenResponsePassword|any = await signIn(supabase, email, password);
    const {data} = await supabase
    .from('user_account')
    .select()
    .eq('user_id', user.data!.user!.id);

    const distinctAccountIds: number[] = [...new Set(data!.map(item => item.account_id))];

    const usersFound = await getUsersByUserIdAndAccountsRepository(supabase, distinctAccountIds, user.data.user!.id)

    for (let index = 0; index < usersFound[0].accounts.length; index++) {
      const account = usersFound[0].accounts[index];

      const tokenInfo: TokenInfoDto = {
        user_id: user.data.user!.id,
        roles: account.roles,
        account_id: account.id,
        active_from: account.active_from,
        active_until: account.active_until,
      }

      usersFound[0].accounts[index].token = buildToken(tokenInfo)
    }



      return new Response(JSON.stringify({message: 'Sign in', payload: usersFound[0]}),
          {
              headers: {
                  "Content-Type": "application/json",
              },
              status: 200,
          });
  } catch (error) {
      console.error('Error login account:', error);
      return new Response(JSON.stringify({status: 'ERROR', message: error}),
          {
              headers: {
                  "Content-Type": "application/json",
              },
              status: 500,
          });
  }
}
