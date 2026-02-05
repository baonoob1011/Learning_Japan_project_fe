import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  sub?: string;
};

export const getUserIdFromToken = (): string | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem("auth-storage");
  if (!raw) {
    console.debug("❌ auth-storage not found");
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const token: string | undefined = parsed?.state?.accessToken;

    if (!token) {
      console.debug("❌ accessToken not found inside auth-storage");
      return null;
    }

    const payload = jwtDecode<JwtPayload>(token);

    if (!payload.sub) {
      console.warn("⚠️ JWT decoded but sub missing", payload);
      return null;
    }

    return payload.sub;
  } catch (e) {
    console.error("❌ Failed to read token from auth-storage", e);
    return null;
  }
};

export const getRolesFromToken = (token: string): string[] => {
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["cognito:groups"] || [];
  } catch {
    return [];
  }
};
