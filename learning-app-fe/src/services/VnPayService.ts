import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

/* ===================== TYPES ===================== */

export type PlanType = "MONTHLY" | "YEARLY" | "LIFETIME";

export interface CreateVnPayResponse {
  paymentUrl?: string;
  orderId?: string;
  [key: string]: unknown;
}
export interface CreateVnPayRequest {
  vipPackageId: string;
}

/**
 * Response khi thanh toán thành công
 */
export interface OrderSuccessResponse {
  orderId: string;
  orderCode: string;
  amount: number;
  paymentMethod: string;
  transactionNo: string;
  paidAt: string;
  expiredAt: string;

  vipPackageId: string;
  packageName: string;
  planType: PlanType;
  durationDays: number | null;
}

/* ===================== SERVICE ===================== */
export const vnPayService = {
  create(vipPackageId: string): Promise<CreateVnPayResponse> {
    return http.post<CreateVnPayResponse>(API_ENDPOINTS.PAYMENT.VNPAY_CREATE, {
      vipPackageId,
    });
  },

  handleReturn(queryString: string): Promise<OrderSuccessResponse> {
    return http.get<OrderSuccessResponse>(
      `${API_ENDPOINTS.PAYMENT.VNPAY_RETURN}?${queryString}`
    );
  },
};
