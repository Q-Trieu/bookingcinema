// src/api/axiosInstance.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api";

// Tăng thời gian timeout để tránh lỗi timeout trên môi trường phát triển
const axiosInstance = axios.create({
  baseURL: baseURL,
  timeout: 30000, // Tăng lên 30 giây
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "Access-Control-Allow-Credentials": "true",
  },
  withCredentials: true, // Đảm bảo gửi cookie trong mọi request
  transformResponse: [
    function (data) {
      try {
        const parsedData = JSON.parse(data);
        // Kiểm tra nếu response có chứa trường OTP (một số API có thể trả về OTP trực tiếp để debug)
        if (parsedData.otp) {
          console.log("OTP nhận được:", parsedData.otp);
        }
        return parsedData;
      } catch {
        return data;
      }
    },
  ],
});

// Thêm tham số CORS cho các request
// Điều này giúp đảm bảo cookie được gửi đi khi sử dụng trên tên miền khác
axios.defaults.withCredentials = true;

// Extend the Axios request config type to include _retry
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Định nghĩa kiểu dữ liệu cho response error
interface ErrorResponse {
  message: string;
  statusCode?: number;
  error?: string;
}

// Request interceptor: attach token if available
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Thêm log request để debug
    if (import.meta.env.DEV) {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${config.url}`,
        config.data || {}
      );
    }

    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  }
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
  (response) => {
    // Log response trong môi trường phát triển
    if (import.meta.env.DEV) {
      console.log(
        `[API Response] ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        response.data
      );
    }
    return response;
  },
  async (error: AxiosError<ErrorResponse>) => {
    // Log lỗi để debug
    if (import.meta.env.DEV) {
      console.error(
        `[API Error] ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }`,
        error.response?.data || error.message
      );
    }

    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Nếu token hết hạn và chưa thử refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      error.response?.data?.message === "Token hết hạn"
    ) {
      originalRequest._retry = true;

      // Nếu đang trong quá trình refresh, đăng ký vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      // Bắt đầu quá trình refresh token
      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      try {
        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Lưu token mới
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Cập nhật header mặc định
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

        // Thông báo cho tất cả request đang chờ
        onRefreshed(accessToken);

        // Thực hiện lại request ban đầu
        return axiosInstance(originalRequest);
      } catch (err) {
        // Xóa token và chuyển hướng về trang đăng nhập
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        // Chuyển hướng đến trang đăng nhập
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý lỗi 400 - Bad Request
    if (error.response?.status === 400) {
      console.error("Lỗi yêu cầu không hợp lệ:", error.response.data);
    }

    // Xử lý lỗi 403 - Không có quyền
    if (error.response?.status === 403) {
      console.error("Không có quyền truy cập tài nguyên này");
      // Có thể chuyển hướng đến trang lỗi 403
      // window.location.href = "/forbidden";
    }

    // Xử lý lỗi 404 - Không tìm thấy
    if (error.response?.status === 404) {
      console.error("Không tìm thấy tài nguyên yêu cầu");
    }

    // Xử lý lỗi 500 - Lỗi server
    if (error.response?.status === 500) {
      console.error("Lỗi máy chủ nội bộ");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
