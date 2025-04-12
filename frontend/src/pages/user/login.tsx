// src/components/LoginForm.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import {
  login,
  facebookLogin,
  googleLogin,
  resendAccountVerification,
} from "../../services/authServices"; // Thêm hàm resendAccountVerification

// Định nghĩa interface cho response data
interface ResponseData {
  message?: string;
  error?: string;
  status?: number;
}

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showResendVerification, setShowResendVerification] =
    useState<boolean>(false);
  const [resendingVerification, setResendingVerification] =
    useState<boolean>(false);
  const [unverifiedAccount, setUnverifiedAccount] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("Đang đăng nhập...");
    setShowResendVerification(false);
    setUnverifiedAccount(false);

    try {
      const response = await login({ email, password });

      if (response.success && response.data) {
        // Lưu token vào localStorage theo key đã định nghĩa trong axiosInstance
        localStorage.setItem("accessToken", response.data.accessToken || "");
        localStorage.setItem("refreshToken", response.data.refreshToken || "");
        localStorage.setItem("user", JSON.stringify(response.data.user || {}));

        setSuccessMessage("Đăng nhập thành công!");
        setError("");
        console.log("Đăng nhập thành công:", response);

        // Chuyển hướng sau khi đăng nhập thành công
        navigate("/");
      } else {
        // Xử lý khi có lỗi được trả về từ service
        const errorMsg =
          response.error?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
        setError(errorMsg);

        // Kiểm tra nếu lỗi liên quan đến tài khoản chưa xác thực
        if (
          response.error?.message?.includes("chưa xác thực") ||
          response.error?.message?.includes("chưa kích hoạt") ||
          response.error?.message?.includes("not verified") ||
          response.error?.message?.includes("not activated")
        ) {
          setShowResendVerification(true);
          setUnverifiedAccount(true);
          setError(
            "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước khi đăng nhập."
          );
        }

        setSuccessMessage("");
      }
    } catch (err: unknown) {
      console.error("Chi tiết lỗi đăng nhập:", err);

      if (axios.isAxiosError(err)) {
        // Xử lý các loại lỗi từ API
        if (err.response) {
          const status = err.response.status;
          const data = err.response.data as ResponseData;

          // Log chi tiết để debug
          console.log("Response status:", status);
          console.log("Response data:", data);

          if (status === 400) {
            if (data.error === "Invalid email or password") {
              setError(
                "Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại."
              );
            } else if (
              data.error?.includes("not verified") ||
              data.error?.includes("not activated") ||
              data.message?.includes("chưa xác thực") ||
              data.message?.includes("chưa kích hoạt") ||
              data.message?.includes("unverified") ||
              data.error?.includes("unverified")
            ) {
              setError(
                "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước khi đăng nhập."
              );
              setShowResendVerification(true);
              setUnverifiedAccount(true);
            } else {
              setError(data.message || "Thông tin đăng nhập không hợp lệ");
            }
          } else if (status === 404) {
            setError("Tài khoản không tồn tại. Vui lòng đăng ký trước.");
          } else if (status === 401) {
            if (
              data.message?.includes("not verified") ||
              data.message?.includes("not activated") ||
              data.error?.includes("not verified") ||
              data.error?.includes("not activated") ||
              data.message?.includes("unverified") ||
              data.error?.includes("unverified")
            ) {
              setError(
                "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước khi đăng nhập."
              );
              setShowResendVerification(true);
              setUnverifiedAccount(true);
            } else {
              setError("Sai thông tin đăng nhập hoặc tài khoản bị khóa");
            }
          } else if (status === 500) {
            setError("Lỗi máy chủ. Vui lòng thử lại sau.");
          } else {
            setError("Đăng nhập thất bại: " + (data.message || err.message));
          }
        } else if (err.request) {
          // Không nhận được phản hồi từ server
          setError(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn."
          );
        } else {
          // Lỗi khi thiết lập request
          setError("Lỗi hệ thống. Vui lòng thử lại sau.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }

      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError("Vui lòng nhập email trước khi gửi lại xác thực");
      return;
    }

    setResendingVerification(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await resendAccountVerification(email);
      if (response.success) {
        setSuccessMessage(
          "Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn."
        );
        // Lưu email để sử dụng ở trang OTP
        localStorage.setItem("pendingActivationEmail", email);
        // Chuyển hướng đến trang xác thực OTP sau 3 giây
        setTimeout(() => {
          navigate("/verify-otp");
        }, 3000);
      } else {
        setError(
          response.error?.message ||
            "Không thể gửi lại xác thực. Vui lòng thử lại sau."
        );
      }
    } catch (err) {
      console.error("Lỗi khi gửi lại xác thực:", err);
      setError("Đã xảy ra lỗi khi gửi lại xác thực. Vui lòng thử lại sau.");
    } finally {
      setResendingVerification(false);
    }
  };

  const handleFacebookLogin = async (response: { accessToken: string }) => {
    try {
      const res = await facebookLogin(response.accessToken);

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", res.data?.accessToken || "");
      localStorage.setItem("refreshToken", res.data?.refreshToken || "");

      setSuccessMessage("Đăng nhập Facebook thành công!");
      setError("");
      console.log("Đăng nhập Facebook thành công:", res);

      // Chuyển hướng sau khi đăng nhập thành công
      navigate("/");
    } catch (err: unknown) {
      console.error("Lỗi đăng nhập Facebook:", err);
      setError("Đăng nhập Facebook thất bại");
    }
  };

  const handleGoogleLogin = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) {
      console.error("Lỗi đăng nhập Google: Credential không hợp lệ");
      setError("Đăng nhập Google thất bại");
      return;
    }

    try {
      const res = await googleLogin(credentialResponse.credential);

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", res.data?.accessToken || "");
      localStorage.setItem("refreshToken", res.data?.refreshToken || "");

      setSuccessMessage("Đăng nhập Google thành công!");
      setError("");
      console.log("Đăng nhập Google thành công:", res);

      // Chuyển hướng sau khi đăng nhập thành công
      navigate("/");
    } catch (err: unknown) {
      console.error("Lỗi đăng nhập Google:", err);
      setError("Đăng nhập Google thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-[#800000] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Đăng nhập
        </h2>

        {error && (
          <div
            className={`${
              unverifiedAccount
                ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                : "bg-red-100 border-red-400 text-red-700"
            } px-4 py-3 rounded mb-4 text-center border`}
          >
            {error}
            {showResendVerification && (
              <div className="mt-2">
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  className={`${
                    unverifiedAccount
                      ? "text-yellow-600 hover:text-yellow-800"
                      : "text-red-600 hover:text-red-800"
                  } font-semibold underline`}
                >
                  {resendingVerification
                    ? "Đang gửi..."
                    : "Gửi lại email xác thực"}
                </button>
              </div>
            )}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            {successMessage}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Nhập Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">
            Mật khẩu
          </label>
          <input
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-3 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } text-white rounded transition-colors font-semibold`}
        >
          {loading ? "ĐANG XỬ LÝ..." : "ĐĂNG NHẬP"}
        </button>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate("/forgot-password")}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Quên mật khẩu?
          </button>
          <button
            onClick={() => {
              setShowResendVerification(true);
            }}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Xác thực tài khoản
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc đăng nhập bằng
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <FacebookLogin
              appId="YOUR_FACEBOOK_APP_ID"
              onSuccess={handleFacebookLogin}
              onFail={(error) => {
                console.error("Lỗi đăng nhập Facebook:", error);
                setError("Đăng nhập Facebook thất bại");
              }}
              onProfileSuccess={(profile) =>
                console.log("Facebook profile:", profile)
              }
              render={({ onClick }) => (
                <button
                  onClick={onClick}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <span className="font-medium">Facebook</span>
                </button>
              )}
            />
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Lỗi đăng nhập Google");
                setError("Đăng nhập Google thất bại");
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
