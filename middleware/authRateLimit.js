import rateLimit from 'express-rate-limit'
import { errorResponse } from '../helpers/ResponseHandler.js'

const limiterOptions = (windowMs, max, message) => ({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => errorResponse(res, message, null, 429)
})

export const loginLimiter = rateLimit(
    limiterOptions(
        5 * 60 * 1000, Number(process.env.RATE_LIMIT_LOGIN_MAX),
        'Too many login Attempts.Try again later'
    )
)

export const forgotPasswordLimiter = rateLimit(limiterOptions
    (
        5 * 60 * 1000, Number(process.env.RATE_LIMIT_FPASS_MAX),
        'To many passwrod requests.Try again later'
    )
)

export const resetPasswordLimiter = rateLimit(
    limiterOptions(5 * 60 * 1000, process.env.RATE_LIMIT_RPASS_MAX,
        'Too many passwords attempts. Try again later.'
    )
);

export const refreshLimiter = rateLimit(
    limiterOptions(
        15 * 60 * 1000,Number(process.env.RATE_LIMIT_REFRESH_MAX),
        'Too many refresh attempts. Try again later.'
    )
);