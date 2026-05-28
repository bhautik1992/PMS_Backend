import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';
import { generateAccessToken } from './JWTToken.js';
import {
    clearRefreshCookie,
    getRefreshTokenFromRequest,
    setRefreshCookie,
    setSessionRefreshCookie,
} from './refreshTokenCookie.js';

const MAX_REFRESH_SESSIONS = Number(process.env.MAX_REFRESH_SESSIONS) || 3;

const MS = {
    session: 24 * 60 * 60 * 1000,
    remember: 30 * 24 * 60 * 60 * 1000,
};

const hashToken = (rawToken) =>
    crypto.createHash('sha256').update(rawToken).digest('hex');

const createRawToken = () => crypto.randomBytes(48).toString('hex');

export const resolveRefreshMaxAgeMs = (rememberMe = false) => {
    const fromEnv = rememberMe
        ? Number(process.env.REFRESH_REMEMBER_MS)
        : Number(process.env.REFRESH_SESSION_MS);

    if (!Number.isNaN(fromEnv) && fromEnv > 0) {
        return fromEnv;
    }

    return rememberMe ? MS.remember : MS.session;
};

export const issueRefreshToken = async (userId, res, rememberMe = false) => {
    const remember = rememberMe;
    const rawToken = createRawToken();
    const maxAgeMs = resolveRefreshMaxAgeMs(remember);
    const expiresAt = new Date(Date.now() + maxAgeMs);

    await RefreshToken.create({
        userId,
        tokenHash: hashToken(rawToken),
        expiresAt,
        rememberMe: remember,
    });

    if (remember) {
        setRefreshCookie(res, rawToken, maxAgeMs);
    } else {
        setSessionRefreshCookie(res, rawToken);
    }

    return rawToken;
};

export const rotateRefreshToken = async (req, res) => {
    const rawToken = getRefreshTokenFromRequest(req);
    if (!rawToken) {
        return { ok: false, status: 401, message: 'Refresh token required' };
    }

    const tokenHash = hashToken(rawToken);
    const stored = await RefreshToken.findOne({ tokenHash });

    if (!stored || stored.expiresAt <= new Date()) {
        if (stored) await RefreshToken.deleteOne({ _id: stored._id });
        clearRefreshCookie(res);
        return { ok: false, status: 401, message: 'Invalid or expired refresh token' };
    }

    const remember = Boolean(stored.rememberMe);
    await RefreshToken.deleteOne({ _id: stored._id });

    const accessToken = generateAccessToken(stored.userId);
    await issueRefreshToken(stored.userId, res, remember);

    return { ok: true, accessToken, userId: stored.userId };
};

export const revokeRefreshTokenFromRequest = async (req, res) => {
    const rawToken = getRefreshTokenFromRequest(req);
    if (rawToken) {
        await RefreshToken.deleteOne({ tokenHash: hashToken(rawToken) });
    }
    clearRefreshCookie(res);
};

export const revokeAllRefreshTokensForUser = async (userId) => {
    await RefreshToken.deleteMany({ userId });
};

export const enforceRefreshSessionLimit = async (userId) => {
    const tokens = await RefreshToken.find({ userId })
        .sort({ createdAt: 1 })
        .select('_id');

    const excess = tokens.length - MAX_REFRESH_SESSIONS + 1;
    if (excess <= 0) return;

    const toRemove = tokens.slice(0, excess).map((t) => t._id);
    await RefreshToken.deleteMany({ _id: { $in: toRemove } });
};

export const revokeAllRefreshTokensForUserAndClearCookie = async (userId, res) => {
    await revokeAllRefreshTokensForUser(userId);
    if (res) clearRefreshCookie(res);
};
