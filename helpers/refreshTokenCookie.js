const COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'pms_refresh_token';

const getBaseCookieOptions = () => {
    const sameSite = process.env.REFRESH_COOKIE_SAME_SITE || 'lax';
    const secure =
        process.env.REFRESH_COOKIE_SECURE === 'true' ||
        (process.env.REFRESH_COOKIE_SECURE !== 'false' && sameSite === 'none');

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: process.env.REFRESH_COOKIE_PATH || '/',
    };
};

export const setRefreshCookie = (res, rawToken, maxAgeMs) => {
    res.cookie(COOKIE_NAME, rawToken, {
        ...getBaseCookieOptions(),
        maxAge: maxAgeMs,
    });
};

/** used Session cookie here and not sending maxAge , cleared when the browser session ends */
export const setSessionRefreshCookie = (res, rawToken) => {
    res.cookie(COOKIE_NAME, rawToken, getBaseCookieOptions());
};

export const clearRefreshCookie = (res) => {
    res.clearCookie(COOKIE_NAME, getBaseCookieOptions());
};

export const getRefreshTokenFromRequest = (req) => req.cookies?.[COOKIE_NAME];
