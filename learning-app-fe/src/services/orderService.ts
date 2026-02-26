import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

/* ===================== TYPES ===================== */

export interface OrderResponse {
    orderId: string;
    orderCode: string;
    amount: number;
    paymentMethod: string;
    transactionNo: string;
    paidAt: string;
    expiredAt: string;
    vipPackageId: string;
    packageName: string;
    planType: string;
    durationDays: number;
}

/* ===================== SERVICE ===================== */

export const orderService = {
    /**
     * 📄 Lấy danh sách hóa đơn của user
     */
    getMyOrders(): Promise<OrderResponse[]> {
        return http.get<OrderResponse[]>(
            API_ENDPOINTS.ORDER.MY_ORDERS
        );
    },

    /**
     * 🧾 Lấy chi tiết 1 hóa đơn theo orderCode
     */
    getMyOrderDetail(orderCode: string): Promise<OrderResponse> {
        return http.get<OrderResponse>(
            API_ENDPOINTS.ORDER.MY_ORDER_DETAIL(orderCode)
        );
    },
};