// src/utils/jwt.ts
export const getRolesFromToken = (token: string): string[] => {
  if (!token) return [];
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["cognito:groups"] || [];
  } catch {
    return [];
  }
};
