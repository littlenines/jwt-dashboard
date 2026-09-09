import axios from "axios";

export const http = axios.create({
  baseURL: "/",
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: (() => void)[] = [];

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push(() => resolve(http(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await http.post("/auth/refresh");
      pendingRequests.forEach((retry) => retry());
      pendingRequests = [];
      return http(originalRequest);
    } catch (refreshError) {
      pendingRequests = [];
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
