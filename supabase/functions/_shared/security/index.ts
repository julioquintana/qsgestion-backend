import jwt from "npm:jsonwebtoken";
import {corsHeaders} from "../index.ts";
import {TokenInfoDto} from "../dto/token-info.dto.ts";

const secretKey = 'your-secret-key';
export const buildToken = (userInfo: TokenInfoDto) => {
    const expiresIn = Math.floor(Date.now() / 1000) + (60 * 60 * 24);

    return [jwt.sign({
        account_id: userInfo.account_id,
        user: userInfo.user_id,
        active: dateIsBetween(userInfo.active_from, userInfo.active_until),
        roles: userInfo.roles,
        exp: expiresIn
    }, secretKey)];
};

const dateIsBetween = (dateFrom: Date, dateUntil: Date) => {
    const currentDate = new Date();
    return currentDate >= new Date(dateFrom) && currentDate <= new Date(dateUntil);
}

const validateToken = (token: string) => {
    try {
        const decodedToken = jwt.verify(token, secretKey) as any;
        console.log('Token decoded:', decodedToken);
        if (decodedToken.active !== true) {
            console.error('Inactive token');
            return false;
        }
        return true;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            console.error('Expired token');
            return false;
        }
        console.error('Invalid token:', error);
        return false;
    }
}

export const validateAppAuthorization = (req: Request) => {
    console.log('Validanting appauthorization header')

    const authHeader = req.headers.get('appauthorization');
    if (!authHeader) {
        console.error('No appauthorization header');
        return new Response(JSON.stringify({error: 'No appauthorization header'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        console.error('Invalid appauthorization header format');
        return new Response(JSON.stringify({error: 'Invalid appauthorization header format'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }

    const appAuthorization = tokenParts[1];
    if (!validateToken(appAuthorization)) {
        console.error('Invalid appauthorization token');
        return new Response(JSON.stringify({error: 'Invalid appauthorization token'}), {
            headers: {...corsHeaders, 'Content-Type': 'application/json'},
            status: 401,
        });
    }

    return null;
}