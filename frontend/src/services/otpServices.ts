import { AxiosError } from "axios";
import apiClient from "./axiosInstance";

interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

interface OtpResponse {
  status: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
  otp?: string;
}

// Gửi OTP qua email (tương đương với forgot-password trong backend)
export const sendOtp = async (email: string): Promise<{ otp?: string }> => {
  try {
    console.log("Sending OTP to email:", email);
    const response = await apiClient.post<OtpResponse>(
      "/auth/forgot-password",
      {
        email,
      },
      { withCredentials: true }
    );
    console.log("Send OTP response:", response.data);
    // Log chi tiết hơn về cấu trúc dữ liệu
    console.log("Response data type:", typeof response.data);
    console.log(
      "Response data structure:",
      JSON.stringify(response.data, null, 2)
    );
    if (response.data.data) {
      console.log("OTP data type:", typeof response.data.data);
      console.log("OTP data keys:", Object.keys(response.data.data));
    }

    // Nếu API trả về OTP (trong môi trường development)
    const otp = response.data.otp || response.data.data?.otp;
    if (otp) {
      console.log("OTP received:", otp);
      return { otp: otp as string };
    }

    return {};
  } catch (error) {
    console.error("Error sending OTP:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorMessage =
        (error as AxiosError<ApiError>).response?.data.message ||
        (error as AxiosError<ApiError>).response?.data.error ||
        "Không thể gửi mã OTP";
      throw new Error(errorMessage);
    }

    throw new Error(
      "Không thể gửi mã OTP. Vui lòng kiểm tra kết nối mạng của bạn."
    );
  }
};

// Xác thực tài khoản sau khi đăng ký (verify-sign-up)
export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  console.log("Attempting to verify OTP for email:", email);
  console.log("OTP value:", otp);

  try {
    // Dựa vào API routes của backend và cấu trúc tham số yêu cầu
    console.log("Trying to verify with endpoint: /auth/verify-sign-up");

    // Cấu trúc JSON mà backend cần nhận, cần gửi đúng định dạng này
    const payload = {
      email: email,
      otp: otp, // Đảm bảo trường này đúng tên theo yêu cầu của API
    };

    console.log("Sending payload:", JSON.stringify(payload));
    console.log("Headers being sent:", {
      Accept: "application/json",
      "Content-Type": "application/json",
      "Cookie được gửi?": "withCredentials=true",
    });

    // Thêm header và tham số để đảm bảo cookie được gửi đi
    const response = await apiClient.post<OtpResponse>(
      "/auth/verify-sign-up",
      payload,
      {
        withCredentials: true,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OTP verification successful:", response.data);
    console.log("Response data type:", typeof response.data);
    console.log(
      "Response data structure:",
      JSON.stringify(response.data, null, 2)
    );
    return;
  } catch (error) {
    console.error("Error verifying OTP with /auth/verify-sign-up:", error);

    // Xem chi tiết lỗi để debug
    if ((error as AxiosError).response) {
      const axiosError = error as AxiosError;
      console.log("Error response data:", axiosError.response?.data);
      console.log("Error response status:", axiosError.response?.status);
      console.log("Error response headers:", axiosError.response?.headers);
      console.log("Error config:", axiosError.config);

      // Hiển thị thông tin chi tiết về lỗi
      console.log(
        "Error response data type:",
        typeof axiosError.response?.data
      );
      console.log(
        "Error response data structure:",
        JSON.stringify(axiosError.response?.data, null, 2)
      );
      console.log("Request headers sent:", axiosError.config?.headers);
      console.log(
        "Was withCredentials set?",
        axiosError.config?.withCredentials
      );
    }

    // Nếu API verify-sign-up không hoạt động, thử endpoint thay thế
    try {
      console.log("Trying alternate endpoint: /auth/verify-password");

      // Giữ cấu trúc đơn giản như backend mong đợi
      const simplePayload = {
        email,
        otp,
      };

      console.log("Sending alternate payload:", JSON.stringify(simplePayload));

      const response = await apiClient.post<OtpResponse>(
        "/auth/verify-password",
        simplePayload,
        { withCredentials: true } // Đảm bảo cookie session được gửi
      );

      console.log(
        "OTP verification successful with alternate endpoint:",
        response.data
      );
      return;
    } catch (secondError) {
      console.error("Error with alternate endpoint:", secondError);

      // Nếu cả hai phương pháp đều thất bại, ném lỗi chi tiết hơn
      if ((error as AxiosError<ApiError>).response) {
        const axiosError = error as AxiosError<ApiError>;

        // Log chi tiết về lỗi để dễ debug
        console.log("Error response data:", axiosError.response?.data);
        console.log("Error response status:", axiosError.response?.status);

        if (axiosError.response?.status === 400) {
          if ((axiosError.response?.data?.error || "").includes("not found")) {
            throw new Error(
              "Mã OTP không tìm thấy. Vui lòng gửi lại OTP và thử lại."
            );
          } else if (
            (axiosError.response?.data?.error || "").includes("expired")
          ) {
            throw new Error("Mã OTP đã hết hạn. Vui lòng gửi lại OTP mới.");
          } else {
            throw new Error("Mã OTP không đúng hoặc đã hết hạn");
          }
        } else if (axiosError.response?.status === 404) {
          throw new Error("Email không tồn tại trong hệ thống");
        } else {
          const errorMessage =
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Xác thực OTP thất bại";
          throw new Error(errorMessage);
        }
      }

      throw new Error("Không thể xác thực OTP. Vui lòng thử lại sau.");
    }
  }
};

// Gửi lại OTP (sử dụng forgot-password trong backend)
export const resendOtp = async (email: string): Promise<{ otp?: string }> => {
  try {
    console.log("Resending OTP to email:", email);
    const response = await apiClient.post<OtpResponse>(
      "/auth/resend-otp",
      { email },
      { withCredentials: true } // Đảm bảo cookie session được gửi
    );
    console.log("Resend OTP response:", response.data);

    // Kiểm tra xem response có chứa OTP không
    const otp = response.data.otp || response.data.data?.otp;
    if (otp) {
      console.log("OTP received:", otp);
      return { otp: otp as string };
    }

    return {};
  } catch (error) {
    console.error("Error resending OTP:", error);

    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response) {
      if (axiosError.response.status === 404) {
        throw new Error("Email không tồn tại trong hệ thống");
      } else if (axiosError.response.status === 429) {
        throw new Error(
          "Bạn đã yêu cầu gửi OTP quá nhiều lần. Vui lòng đợi một lát."
        );
      } else if (axiosError.response.data) {
        const errorMessage =
          axiosError.response.data.message ||
          axiosError.response.data.error ||
          "Không thể gửi lại mã OTP";
        throw new Error(errorMessage);
      }
    }

    throw new Error(
      "Không thể gửi lại mã OTP. Vui lòng kiểm tra kết nối mạng của bạn."
    );
  }
};
