// src/api/axiosInstance.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const axiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Extend the Axios request config type to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Request interceptor: attach token if available
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshingSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshingSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshingSubscribers.forEach((callback) => callback(token));
  refreshingSubscribers = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<string>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If refresh is already happening, subscribe to it
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            // Update the authorization header and retry the original request
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      // Otherwise, mark as refreshing and proceed to refresh the token
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");
      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });
        const newToken = response.data.accessToken;
        localStorage.setItem("accessToken", newToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        onRefreshed(newToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
