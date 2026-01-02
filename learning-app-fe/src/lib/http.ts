import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/services/api-types";

async function unwrapResponse<T>(promise: Promise<{ data: ApiResponse<T> }>) {
  const res = await promise;
  if (!res.data.success) {
    throw new Error(res.data.message || "API request failed");
  }
  return res.data.result;
}

export const http = {
  get<T>(url: string) {
    return unwrapResponse<T>(axiosClient.get(url));
  },
  post<T>(url: string, body?: unknown) {
    return unwrapResponse<T>(axiosClient.post(url, body));
  },
  put<T>(url: string, body?: unknown) {
    return unwrapResponse<T>(axiosClient.put(url, body));
  },
  delete<T>(url: string) {
    return unwrapResponse<T>(axiosClient.delete(url));
  },
};
