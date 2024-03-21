import jwt from "npm:jsonwebtoken";
import {corsHeaders} from "../index.ts";
import {TokenInfoDto} from "../dto/token-info.dto.ts";

const secretKey = 'your-secret-key';

export const buildToken = (userInfo: TokenInfoDto) => {
    const expiresIn = Math.floor(Date.now() / 1000) + (60 * 60 * 24);

    return jwt.sign({
        account_id: userInfo.account_id,
        user: userInfo.user_id,
        active: dateIsBetween(userInfo.active_from, userInfo.active_until),
        roles: userInfo.roles,
        exp: expiresIn
    }, secretKey);
};

const dateIsBetween = (dateFrom: Date, dateUntil: Date) => {
    const currentDate = new Date();
    return currentDate >= new Date(dateFrom) && currentDate <= new Date(dateUntil);
}

const validateToken = (token: string) => {
    try {
        const decodedToken = jwt.verify(token, secretKey) as any;
        if (decodedToken.active !== true) {
            console.error('Inactive token');
            return false;
        }
        return true;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Expired token');
        }
        console.error('Invalid token:', error);
        throw error;
    }
}

export const getValueToken = (token: string) => {
    try {
        return jwt.verify(token, secretKey) as any;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Expired token');
        }
        console.error('Invalid token:', error);
        throw  error
    }
}

export function getTokenAfterSplit(token: string) {
    const tokenParts = token.split(' ');
    return (tokenParts[1])

}

export function getPayloadToken(req: Request) {
    const authHeader: string | null = req.headers.get('app-authorization');
    const token = getTokenAfterSplit(authHeader!);
    return (getValueToken(token))
}

export const validateAppAuthorizationMiddleware = (req: Request, authorizationKeys: string[]) => {
    console.log('Validanting app-authorization header')

    const authHeader = req.headers.get('app-authorization');
    if (!authHeader) {
        console.error('App-authorization header is required');
        return new Response(JSON.stringify({error: 'App-authorization header is required'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.error('Invalid app authorization header format');
        return new Response(JSON.stringify({error: 'Invalid appa uthorization header format'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }
    if (!validateAuthorizationKeys(getTokenAfterSplit(authHeader), authorizationKeys)) {
        console.error('Unauthorized for this action');
        return new Response(JSON.stringify({error: 'Unauthorized for this action'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }
    
    const appAuthorization = tokenParts[1];
    if (!validateToken(appAuthorization)) {
        console.error('Invalid appauthorization token');
        return new Response(JSON.stringify({error: 'Invalid app authorization token'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }

    return null;
}

export const validateAuthorizationKeys = (token: string, authorizationKey: string[]) => {
    if(authorizationKey.length < 1) return  true
    const decodedToken = getValueToken(token);
    if (!decodedToken) {
        return false;
    }
    return authorizationKey.some(key => decodedToken.roles.includes(key));
}