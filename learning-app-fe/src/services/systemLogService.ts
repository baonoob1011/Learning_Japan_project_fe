import { http } from "@/lib/http";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SystemLog {
    id: string;
    username: string;
    ipAddress: string;
    targetClass: string;
    methodName: string;
    arguments: string;
    result: string;
    executionTime: number;
    status: "SUCCESS" | "FAILURE";
    errorMessage: string | null;
    createdAt: string;
}

export interface SystemLogPage {
    content: SystemLog[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface SystemLogParams {
    page?: number;
    size?: number;
    status?: "SUCCESS" | "FAILURE" | "";
    username?: string;
    keyword?: string;
    from?: string;
    to?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const systemLogService = {
    getSystemLogs(params: SystemLogParams = {}): Promise<SystemLogPage> {
        const cleanParams: Record<string, string | number> = {
            page: params.page ?? 0,
            size: params.size ?? 20,
        };
        if (params.status) cleanParams.status = params.status;
        if (params.username?.trim()) cleanParams.username = params.username.trim();
        if (params.keyword?.trim()) cleanParams.keyword = params.keyword.trim();
        if (params.from) cleanParams.from = params.from;
        if (params.to) cleanParams.to = params.to;

        return http.get<SystemLogPage>("/admin/system-logs", { params: cleanParams });
    },

    getSystemLogById(id: string): Promise<SystemLog> {
        return http.get<SystemLog>(`/admin/system-logs/${id}`);
    },
};
