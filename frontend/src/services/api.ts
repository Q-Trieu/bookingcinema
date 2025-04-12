import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("Không thể kết nối đến server. Vui lòng kiểm tra:");
      console.error("1. Backend server đã được khởi động");
      console.error("2. URL và port là chính xác");
      console.error("3. CORS đã được cấu hình đúng ở backend");
    } else if (error.response) {
      // Xử lý lỗi từ server
      console.error("API Error:", error.response.data);
    } else if (error.request) {
      // Xử lý lỗi không nhận được response
      console.error("Network Error:", error.request);
    } else {
      // Xử lý lỗi khác
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
