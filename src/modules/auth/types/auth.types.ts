import { User } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  tokens: AuthTokens;
}

export interface DecodedToken {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface JwtSignOptions {
  expiresIn: string | number;
  algorithm: 'HS256';
}
