import { useAuthStore } from "@/stores/authStore";
import { getRolesFromToken } from "@/utils/jwt";
import { useMemo } from "react";

/**
 * Hook to check if the current user has the VIP role.
 * This can be used across the application to gate features or change UI.
 */
export const useVip = (): boolean => {
    const { accessToken } = useAuthStore();

    const isVip = useMemo(() => {
        if (!accessToken) return false;
        try {
            const userRoles = getRolesFromToken(accessToken);
            return userRoles.includes("USER_VIP");
        } catch (e) {
            return false;
        }
    }, [accessToken]);

    return isVip;
};
