import { http } from "@/lib/http";
import { API_ENDPOINTS } from "@/config/api";

/* ===================== TYPES ===================== */

export interface RevenueSummaryResponse {
    totalRevenue: number;
    todayRevenue: number;
    monthRevenue: number;
    totalSuccessOrders: number;
    generatedAt: string;
}

export interface CourseRevenueResponse {
    courseTitle: string;
    revenue: number;
}

export interface ProductRevenueResponse {
    productId: string;
    name: string;
    type: "COURSE" | "VIP";
    revenue: number;
}

export interface MonthlyRevenueResponse {
    month: number;
    monthName: string;
    revenue: number;
}

export interface YearlyRevenueResponse {
    year: number;
    revenue: number;
}

export interface OrderItem {
    id: string;
    productType: string;
    courseId?: string;
    courseName?: string;
    courseTitle?: string;
    vipPackageId?: string;
    vipPackageName?: string;
    price: number;
}

export interface Order {
    id: string;
    amount: number;
    orderCode: string;
    transactionNo: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
    paidAt: string;
    user: { fullName: string; email: string; avatarUrl?: string };
    orderItems: OrderItem[];
}

/* ===================== SERVICE ===================== */

export const revenueService = {
    /**
     * 📊 Lấy dashboard revenue tổng quan
     */
    getSummary(): Promise<RevenueSummaryResponse> {
        return http.get<RevenueSummaryResponse>(
            API_ENDPOINTS.REVENUE.SUMMARY
        );
    },

    /**
     * 📅 Lấy doanh thu theo ngày
     */
    getByDay(date: string): Promise<number> {
        return http.get<number>(
            API_ENDPOINTS.REVENUE.BY_DAY(date)
        );
    },

    /**
     * 📆 Lấy doanh thu theo tháng
     */
    getByMonth(
        year: number,
        month: number
    ): Promise<number> {
        return http.get<number>(
            API_ENDPOINTS.REVENUE.BY_MONTH(year, month)
        );
    },

    /**
     * 📦 Tổng số đơn thành công
     */
    getSuccessCount(): Promise<number> {
        return http.get<number>(
            API_ENDPOINTS.REVENUE.SUCCESS_COUNT
        );
    },

    getByCourse(): Promise<CourseRevenueResponse[]> {
        return http.get<CourseRevenueResponse[]>(
            API_ENDPOINTS.REVENUE.COURSE
        );
    },

    /**
     * 📦 Doanh thu theo sản phẩm (Course vs VIP)
     */
    getByProduct(): Promise<ProductRevenueResponse[]> {
        return http.get<ProductRevenueResponse[]>(
            API_ENDPOINTS.REVENUE.PRODUCT
        );
    },

    /**
     * 🗓️ Doanh thu theo tháng trong năm
     */
    getMonthly(year: number): Promise<MonthlyRevenueResponse[]> {
        return http.get<MonthlyRevenueResponse[]>(
            API_ENDPOINTS.REVENUE.MONTHLY(year)
        );
    },

    /**
     * 🗓️ Doanh thu theo năm
     */
    getYearly(startYear: number, endYear: number): Promise<YearlyRevenueResponse[]> {
        return http.get<YearlyRevenueResponse[]>(
            API_ENDPOINTS.REVENUE.YEARLY(startYear, endYear)
        );
    },

    /**
     * 📜 Lịch sử giao dịch gần đây
     */
    getRecentTransactions(): Promise<Order[]> {
        return http.get<Order[]>(
            API_ENDPOINTS.REVENUE.RECENT
        );
    },

    /**
     * 📈 Dữ liệu biểu đồ 30 ngày
     */
    getChart30Days(): Promise<Record<string, number>> {
        return http.get<Record<string, number>>(
            API_ENDPOINTS.REVENUE.CHART_30DAYS
        );
    }
};