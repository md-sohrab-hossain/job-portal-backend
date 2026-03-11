import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
  cookies: {
    accessToken?: string;
    refreshToken?: string;
    [key: string]: string | undefined;
  };
}
