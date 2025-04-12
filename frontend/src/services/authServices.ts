import axiosInstance from "./axiosInstance";
import { AxiosError } from "axios";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    is_active: boolean;
    is_locked: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Thêm hàm xác thực dữ liệu
const validateRegisterData = (credentials: RegisterCredentials): boolean => {
  const { email, password, full_name, phone } = credentials;

  if (!email || !password || !full_name || !phone) {
    return false;
  }

  // Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return false;
  }

  // Kiểm tra mật khẩu
  if (password.length < 6) {
    return false;
  }

  // Kiểm tra số điện thoại
  const phoneRegex = /^(0|\+84)(\d{9,10})$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }

  return true;
};

export const login = async (
  credentials: LoginCredentials
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    console.log("Logging in with credentials:", { email: credentials.email });
    const response = await axiosInstance.post("/auth/sign-in", credentials);

    // Lưu tokens vào localStorage sau khi đăng nhập thành công
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error logging in:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorResponse = (error as AxiosError<ApiError>).response;
      const responseData = errorResponse?.data;
      const status = errorResponse?.status;

      // Tạo đối tượng error với kiểu ApiError
      const errorData: ApiError = {
        message: responseData?.message || "Đăng nhập thất bại",
        error: responseData?.error,
        statusCode: status,
      };

      // Xử lý các trường hợp lỗi cụ thể theo status code

      // 1. Kiểm tra các từ khóa liên quan đến tài khoản chưa xác thực
      const unverifiedKeywords = [
        "not verified",
        "not activated",
        "unverified",
        "chưa xác thực",
        "chưa kích hoạt",
        "verification required",
      ];

      // Kiểm tra nếu thông báo lỗi chứa từ khóa liên quan đến tài khoản chưa xác thực
      const hasUnverifiedKeyword = (
        message?: string,
        error?: string
      ): boolean => {
        if (!message && !error) return false;

        for (const keyword of unverifiedKeywords) {
          if (
            message?.toLowerCase().includes(keyword.toLowerCase()) ||
            error?.toLowerCase().includes(keyword.toLowerCase())
          ) {
            return true;
          }
        }
        return false;
      };

      // Tài khoản chưa xác thực
      if (hasUnverifiedKeyword(responseData?.message, responseData?.error)) {
        return {
          success: false,
          error: {
            message:
              "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước khi đăng nhập.",
            error: "AccountNotVerified",
            statusCode: 401,
          },
        };
      }

      // Email hoặc mật khẩu không đúng
      if (
        status === 400 &&
        (responseData?.error === "Invalid email or password" ||
          responseData?.message?.includes("password"))
      ) {
        return {
          success: false,
          error: {
            message: "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.",
            error: "AuthFailed",
          },
        };
      }

      return {
        success: false,
        error: errorData,
      };
    }

    return {
      success: false,
      error: {
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      },
    };
  }
};

export const register = async (
  credentials: RegisterCredentials
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    // Xác thực dữ liệu trước khi gửi
    if (!validateRegisterData(credentials)) {
      return {
        success: false,
        error: {
          message: "Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.",
        },
      };
    }

    // Chuẩn hóa dữ liệu trước khi gửi
    const formattedData = {
      full_name: credentials.full_name.trim(),
      email: credentials.email.trim().toLowerCase(),
      phone: credentials.phone.trim(),
      password: credentials.password,
    };

    const response = await axiosInstance.post("/auth/sign-up", formattedData);

    // Tự động đăng nhập người dùng sau khi đăng ký thành công
    const { accessToken, refreshToken } = response.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error registering:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      const axiosError = error as AxiosError<ApiError>;
      const errorData = axiosError.response?.data;

      // Kiểm tra cụ thể lỗi email đã tồn tại
      if (
        errorData?.error === "Email already exist" ||
        errorData?.message?.includes("email") ||
        axiosError.response?.status === 409
      ) {
        return {
          success: false,
          error: {
            message:
              "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.",
            error: "Email already exist",
          },
        };
      }

      // Các lỗi Bad Request (status 400)
      if (axiosError.response?.status === 400) {
        return {
          success: false,
          error: errorData || { message: "Thông tin đăng ký không hợp lệ." },
        };
      }

      return {
        success: false,
        error: errorData,
      };
    }

    return {
      success: false,
      error: {
        message: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.",
      },
    };
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post("/auth/sign-out");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to log out");
  }
};

export const facebookLogin = async (
  accessToken: string
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    const response = await axiosInstance.post("/auth/facebook", {
      accessToken,
    });

    // Lưu tokens vào localStorage sau khi đăng nhập thành công
    const { accessToken: token, refreshToken } = response.data;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error logging in with Facebook:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      return {
        success: false,
        error: (error as AxiosError<ApiError>).response?.data,
      };
    }

    return {
      success: false,
      error: {
        message:
          "Failed to log in with Facebook. Please check your connection.",
      },
    };
  }
};

export const googleLogin = async (
  accessToken: string
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    const response = await axiosInstance.post("/auth/google", { accessToken });

    // Lưu tokens vào localStorage sau khi đăng nhập thành công
    const { accessToken: token, refreshToken } = response.data;
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error logging in with Google:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      return {
        success: false,
        error: (error as AxiosError<ApiError>).response?.data,
      };
    }

    return {
      success: false,
      error: {
        message: "Failed to log in with Google. Please check your connection.",
      },
    };
  }
};

export const forgotPassword = async (
  email: string
): Promise<{ success: boolean; error?: ApiError }> => {
  try {
    await axiosInstance.post("/auth/forgot-password", { email });
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      return {
        success: false,
        error: (error as AxiosError<ApiError>).response?.data,
      };
    }

    return {
      success: false,
      error: { message: "Failed to send OTP. Please check your connection." },
    };
  }
};

export const resendAccountVerification = async (
  email: string
): Promise<{ success: boolean; error?: ApiError }> => {
  try {
    console.log("Resending verification for email:", email);
    // Sử dụng endpoint /auth/resend-verification hoặc tương tự
    // Nếu backend không có endpoint chính xác, có thể thử một số endpoint phổ biến
    try {
      // Thử endpoint đầu tiên
      await axiosInstance.post("/auth/resend-verification", { email });
      return { success: true };
    } catch (innerError) {
      if ((innerError as AxiosError).response?.status === 404) {
        // Nếu endpoint đầu tiên không tồn tại, thử endpoint thứ hai
        try {
          await axiosInstance.post("/auth/verify-email/resend", { email });
          return { success: true };
        } catch (secondError) {
          if ((secondError as AxiosError).response?.status === 404) {
            // Nếu endpoint thứ hai không tồn tại, thử endpoint thứ ba
            // Sử dụng forgot-password có thể cũng gửi email xác thực/OTP
            await axiosInstance.post("/auth/forgot-password", { email });
            return { success: true };
          }
          throw secondError;
        }
      }
      throw innerError;
    }
  } catch (error) {
    console.error("Error resending verification:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorResponse = (error as AxiosError<ApiError>).response;
      const errorData = errorResponse?.data || {
        message: "Lỗi không xác định",
      };

      // Kiểm tra và xử lý các loại lỗi cụ thể
      if (errorResponse?.status === 404) {
        return {
          success: false,
          error: {
            message:
              "Email không tồn tại trong hệ thống. Vui lòng đăng ký trước.",
            error: "EmailNotFound",
          },
        };
      }

      if (
        errorResponse?.status === 400 &&
        ((errorData.message &&
          errorData.message.includes("already verified")) ||
          (errorData.error && errorData.error.includes("already verified")))
      ) {
        return {
          success: false,
          error: {
            message:
              "Tài khoản này đã được xác thực. Bạn có thể đăng nhập ngay bây giờ.",
            error: "AlreadyVerified",
          },
        };
      }

      return {
        success: false,
        error: errorData,
      };
    }

    return {
      success: false,
      error: { message: "Không thể gửi lại xác thực. Vui lòng thử lại sau." },
    };
  }
};

export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: ApiError }> => {
  try {
    await axiosInstance.post("/auth/reset-password", { email, newPassword });
    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);

    if ((error as AxiosError<ApiError>).response?.data) {
      return {
        success: false,
        error: (error as AxiosError<ApiError>).response?.data,
      };
    }

    return {
      success: false,
      error: {
        message: "Failed to reset password. Please check your connection.",
      },
    };
  }
};

// Gửi yêu cầu xác thực tài khoản
export const verifyAccount = async (
  email: string,
  otpCode: string
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    console.log("Verifying account with:", { email, otpCode });

    // Log rõ ràng toàn bộ thông tin để debug
    console.log("Email:", email);
    console.log("OTP code:", otpCode);

    // Backend yêu cầu tham số otp, và phụ thuộc vào session để kiểm tra
    // Không cần thêm session vào payload vì nó đã được lưu trong cookie
    const payload = {
      email: email,
      otp: otpCode,
    };

    console.log("Sending payload:", JSON.stringify(payload));

    // Gửi request với credentials: 'include' để gửi cookie
    const response = await axiosInstance.post("/auth/verify-sign-up", payload, {
      withCredentials: true, // Quan trọng: đảm bảo cookie được gửi với request
    });

    console.log("Verify account response:", response);
    console.log("Verify account data:", response.data);

    // Backend trả về { access_token, user }
    const authResponse: AuthResponse = {
      accessToken: response.data.access_token || "",
      refreshToken: response.data.refresh_token || "",
      user: response.data.user || {
        id: 0,
        email: email,
        full_name: "",
        phone: "",
        is_active: true,
        is_locked: false,
      },
    };

    // Lưu token sau khi xác thực thành công
    if (response.data.access_token) {
      localStorage.setItem("accessToken", response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem("refreshToken", response.data.refresh_token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
    }

    return {
      success: true,
      data: authResponse,
    };
  } catch (error) {
    console.error("Error verifying account:", error);

    // Log chi tiết về lỗi để dễ debug
    if ((error as AxiosError).response) {
      const axiosError = error as AxiosError;
      console.log("Error response data:", axiosError.response?.data);
      console.log("Error response status:", axiosError.response?.status);
      console.log("Error response headers:", axiosError.response?.headers);
      console.log("Error request data:", axiosError.request?.data);
      console.log("Error config:", axiosError.config);
    }

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorResponse = (error as AxiosError<ApiError>).response;
      const responseData = errorResponse?.data;

      // Phân loại lỗi cụ thể
      if (
        errorResponse?.status === 400 &&
        responseData?.error === "OTP not found"
      ) {
        return {
          success: false,
          error: {
            message: "Mã OTP không tìm thấy. Vui lòng gửi lại OTP và thử lại.",
            error: "OTPNotFound",
            statusCode: 400,
          },
        };
      } else if (
        errorResponse?.status === 400 &&
        (responseData?.error || "").includes("expired")
      ) {
        return {
          success: false,
          error: {
            message: "Mã OTP đã hết hạn. Vui lòng gửi lại OTP mới.",
            error: "OTPExpired",
            statusCode: 400,
          },
        };
      }

      return {
        success: false,
        error: {
          message: responseData?.message || "Không thể xác thực tài khoản",
          error: responseData?.error,
          statusCode: errorResponse?.status,
        },
      };
    }

    return {
      success: false,
      error: {
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      },
    };
  }
};

// Gửi lại mã OTP xác thực tài khoản (tương đương với forgotPassword trong backend)
export const resendVerificationOtp = async (
  email: string
): Promise<{ success: boolean; data?: { otp?: string }; error?: ApiError }> => {
  try {
    console.log("Attempting to resend OTP for email:", email);

    // Dựa vào API backend, sử dụng forgotPassword để gửi lại OTP
    // Đảm bảo gửi request với credentials để nhận cookie chứa session
    const response = await axiosInstance.post(
      "/auth/forgot-password",
      { email },
      { withCredentials: true }
    );

    console.log("Resend OTP response:", response.data);

    // Kiểm tra xem response có chứa OTP không
    // (một số API trả về OTP trong môi trường development)
    const responseData = {
      otp: response.data.otp || response.data.data?.otp || undefined,
    };

    return {
      success: true,
      data: responseData,
    };
  } catch (error) {
    console.error("Error resending verification OTP:", error);

    // Log chi tiết lỗi để debug
    if ((error as AxiosError).response) {
      const axiosError = error as AxiosError;
      console.log("Error response data:", axiosError.response?.data);
      console.log("Error response status:", axiosError.response?.status);
      console.log("Error response headers:", axiosError.response?.headers);
    }

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorResponse = (error as AxiosError<ApiError>).response;
      const responseData = errorResponse?.data;

      // Xử lý lỗi cụ thể từ API
      if (errorResponse?.status === 404) {
        return {
          success: false,
          error: {
            message: "Email không tồn tại trong hệ thống",
            error: "UserNotFound",
            statusCode: 404,
          },
        };
      }

      return {
        success: false,
        error: {
          message: responseData?.message || "Không thể gửi lại mã xác thực",
          error: responseData?.error,
          statusCode: errorResponse?.status,
        },
      };
    }

    return {
      success: false,
      error: {
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      },
    };
  }
};

// Thêm phương thức mới để thử nhiều cách truyền tham số khác nhau
export const verifyAccountAlternative = async (
  email: string,
  otpCode: string
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    console.log("Trying alternative verification with:", { email, otpCode });

    // Thử với nhiều cấu trúc payload khác nhau
    // Cấu trúc 1: chỉ email và mã OTP
    const payload1 = {
      email: email,
      otp: otpCode,
    };

    // Cấu trúc 2: email, otp_code (tên tham số khác)
    const payload2 = {
      email: email,
      otp_code: otpCode,
    };

    // Cấu trúc 3: với thêm session
    const payload3 = {
      email: email,
      otp: otpCode,
      session: {},
    };

    // Dùng cấu trúc 3 cho request đầu tiên
    console.log("Trying payload 3:", JSON.stringify(payload3));

    try {
      // Thử cấu trúc 3 trước
      const response = await axiosInstance.post(
        "/auth/verify-sign-up",
        payload3
      );
      console.log("Verification successful with payload 3:", response.data);

      // Xử lý response và trả về kết quả
      const authResponse: AuthResponse = {
        accessToken: response.data.access_token || "",
        refreshToken: response.data.refresh_token || "",
        user: response.data.user || {
          id: 0,
          email: email,
          full_name: "",
          phone: "",
          is_active: true,
          is_locked: false,
        },
      };

      if (response.data.access_token) {
        localStorage.setItem("accessToken", response.data.access_token);
        if (response.data.refresh_token) {
          localStorage.setItem("refreshToken", response.data.refresh_token);
        }
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      }

      return {
        success: true,
        data: authResponse,
      };
    } catch (error3) {
      console.error("Error with payload 3:", error3);

      // Nếu cấu trúc 3 thất bại, thử cấu trúc 1
      console.log("Trying payload 1:", JSON.stringify(payload1));

      try {
        const response = await axiosInstance.post(
          "/auth/verify-sign-up",
          payload1
        );
        console.log("Verification successful with payload 1:", response.data);

        // Xử lý response và trả về kết quả
        const authResponse: AuthResponse = {
          accessToken: response.data.access_token || "",
          refreshToken: response.data.refresh_token || "",
          user: response.data.user || {
            id: 0,
            email: email,
            full_name: "",
            phone: "",
            is_active: true,
            is_locked: false,
          },
        };

        if (response.data.access_token) {
          localStorage.setItem("accessToken", response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem("refreshToken", response.data.refresh_token);
          }
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        }

        return {
          success: true,
          data: authResponse,
        };
      } catch (error1) {
        console.error("Error with payload 1:", error1);

        // Nếu cấu trúc 1 thất bại, thử cấu trúc 2
        console.log("Trying payload 2:", JSON.stringify(payload2));

        try {
          const response = await axiosInstance.post(
            "/auth/verify-sign-up",
            payload2
          );
          console.log("Verification successful with payload 2:", response.data);

          // Xử lý response và trả về kết quả
          const authResponse: AuthResponse = {
            accessToken: response.data.access_token || "",
            refreshToken: response.data.refresh_token || "",
            user: response.data.user || {
              id: 0,
              email: email,
              full_name: "",
              phone: "",
              is_active: true,
              is_locked: false,
            },
          };

          if (response.data.access_token) {
            localStorage.setItem("accessToken", response.data.access_token);
            if (response.data.refresh_token) {
              localStorage.setItem("refreshToken", response.data.refresh_token);
            }
            if (response.data.user) {
              localStorage.setItem("user", JSON.stringify(response.data.user));
            }
          }

          return {
            success: true,
            data: authResponse,
          };
        } catch (error2) {
          console.error("Error with payload 2:", error2);

          // Thử với endpoint khác
          console.log("Trying alternate endpoint: /auth/verify-password");

          try {
            const response = await axiosInstance.post(
              "/auth/verify-password",
              payload1
            );
            console.log(
              "Verification successful with alternate endpoint:",
              response.data
            );

            // Xử lý response và trả về kết quả
            const authResponse: AuthResponse = {
              accessToken: response.data.access_token || "",
              refreshToken: response.data.refresh_token || "",
              user: response.data.user || {
                id: 0,
                email: email,
                full_name: "",
                phone: "",
                is_active: true,
                is_locked: false,
              },
            };

            if (response.data.access_token) {
              localStorage.setItem("accessToken", response.data.access_token);
              if (response.data.refresh_token) {
                localStorage.setItem(
                  "refreshToken",
                  response.data.refresh_token
                );
              }
              if (response.data.user) {
                localStorage.setItem(
                  "user",
                  JSON.stringify(response.data.user)
                );
              }
            }

            return {
              success: true,
              data: authResponse,
            };
          } catch (altError) {
            console.error("All verification attempts failed");
            throw altError; // Ném lỗi để xử lý ở khối catch bên ngoài
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in alternative verification:", error);

    // Log chi tiết về lỗi để dễ debug
    if ((error as AxiosError).response) {
      const axiosError = error as AxiosError;
      console.log("Error response data:", axiosError.response?.data);
      console.log("Error response status:", axiosError.response?.status);
      console.log("Error response headers:", axiosError.response?.headers);
    }

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorResponse = (error as AxiosError<ApiError>).response;
      const responseData = errorResponse?.data;

      // Phân loại lỗi cụ thể
      if (
        errorResponse?.status === 400 &&
        responseData?.error === "OTP not found"
      ) {
        return {
          success: false,
          error: {
            message: "Mã OTP không đúng hoặc đã hết hạn",
            error: "InvalidOtp",
            statusCode: 400,
          },
        };
      }

      return {
        success: false,
        error: {
          message: responseData?.message || "Không thể xác thực tài khoản",
          error: responseData?.error,
          statusCode: errorResponse?.status,
        },
      };
    }

    return {
      success: false,
      error: {
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      },
    };
  }
};

// Thử nghiệm với cấu trúc đơn giản nhất để xem API cần payload nào
export const verifyAccountSimple = async (
  email: string,
  otpCode: string
): Promise<{ success: boolean; data?: AuthResponse; error?: ApiError }> => {
  try {
    console.log(
      "Trying simplest verification with email:",
      email,
      "and OTP:",
      otpCode
    );

    // Dùng cấu trúc đơn giản nhất
    const payload = {
      email: email,
      otp: otpCode,
    };

    console.log("Sending simple payload:", JSON.stringify(payload));

    // Gửi request với tham số đơn giản nhất
    const response = await axiosInstance.post("/auth/verify-sign-up", payload, {
      withCredentials: true,
    });

    console.log(
      "Simple verification response:",
      response.status,
      response.statusText
    );
    console.log(
      "Simple verification data:",
      JSON.stringify(response.data, null, 2)
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error in simple verification:", error);

    // Log chi tiết lỗi
    if ((error as AxiosError).response) {
      const axiosError = error as AxiosError;
      console.log("Error response status:", axiosError.response?.status);
      console.log(
        "Error response data:",
        JSON.stringify(axiosError.response?.data, null, 2)
      );
      console.log("Request config:", {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        data: axiosError.config?.data,
        headers: axiosError.config?.headers,
        withCredentials: axiosError.config?.withCredentials,
      });
    }

    if ((error as AxiosError<ApiError>).response?.data) {
      const errorResponse = (error as AxiosError<ApiError>).response;
      const responseData = errorResponse?.data;

      return {
        success: false,
        error: {
          message: responseData?.message || "Không thể xác thực OTP",
          error: responseData?.error,
          statusCode: errorResponse?.status,
        },
      };
    }

    return {
      success: false,
      error: {
        message:
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      },
    };
  }
};
