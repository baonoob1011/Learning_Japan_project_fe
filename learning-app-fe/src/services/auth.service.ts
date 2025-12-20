import api from "@/lib/axios";
import { UserLoginRequest, LoginResponse } from "@/lib/auth";

export const AuthService = {
  login: async (data: UserLoginRequest): Promise<LoginResponse> => {
    const res = await api.post("/auth/login", data);
    return res.data.result;
  },

  refreshToken: async (username: string, refreshToken: string) => {
    const res = await api.post("/auth/refresh-token", {
      username,
      refreshToken,
    });
    return res.data.result;
  },

  logout: async (accessToken: string) => {
    await api.post("/auth/logout", { accessToken });
  },
};
