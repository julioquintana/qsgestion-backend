import {Session, User} from "https://esm.sh/v135/@supabase/gotrue-js@2.62.2/dist/module/lib/types.d.ts";


export interface SignUpUserDto {
    user: User | null;
    session: Session | null;
    error: any | null;
}