// src/types/auth.ts
export type RegisterRequest = {
  email: string;
  password: string;
  displayName: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user?: { id: string; email: string; displayName: string; role?: string };
};

export type MeResponse = {
  id: string;
  email: string;
  displayName: string;
  role?: string;
};
