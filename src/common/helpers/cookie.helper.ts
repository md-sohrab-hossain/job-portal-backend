import type { Response } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  accessToken: { maxAge: 60 * 60 * 1000 },
  refreshToken: { maxAge: 7 * 24 * 60 * 60 * 1000 },
};

const commonCookieOptions = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: isProduction,
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
  res.cookie('accessToken', accessToken, { ...commonCookieOptions, maxAge: COOKIE_OPTIONS.accessToken.maxAge });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, { ...commonCookieOptions, maxAge: COOKIE_OPTIONS.refreshToken.maxAge });
  }
}

export function clearAuthCookies(res: Response): void {
  res.cookie('accessToken', '', { ...commonCookieOptions, maxAge: 0 });
  res.cookie('refreshToken', '', { ...commonCookieOptions, maxAge: 0 });
}
