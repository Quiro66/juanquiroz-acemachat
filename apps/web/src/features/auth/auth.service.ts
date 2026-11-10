
import { api } from "@/lib/axios";

import type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
} from "./auth.types";

export async function loginUser(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await api.post<AuthResponse<LoginResponse>>(
    "/auth/login",
    credentials,
  );

  return response.data.data;
}

export async function registerUser(
  credentials: RegisterCredentials,
): Promise<AuthUser> {
  const response = await api.post<AuthResponse<AuthUser>>(
    "/auth/register",
    credentials,
  );

  return response.data.data;
}

export async function getCurrentUser(
  token: string,
): Promise<AuthUser> {
  const response = await api.get<AuthResponse<AuthUser>>(
    "/auth/me",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.data;
}
