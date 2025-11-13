// src/services/auth.ts
import { api } from "./api";
import type { RegisterRequest, LoginRequest, AuthResponse, MeResponse } from "../types/auth";

export const authService = {
  register(payload: RegisterRequest) {
    // răspunsul real e gol -> folosește void
    return api.post<void>("/auth/register", payload);
  },
  login(payload: LoginRequest) {
    return api.post<AuthResponse>("/auth/login", payload);
  },
  me() {
    return api.get<MeResponse>("/auth/me");
  },
};
