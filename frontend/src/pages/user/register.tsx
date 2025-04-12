// src/components/RegisterForm.tsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { GoogleLogin } from "@react-oauth/google";
import {
  register as registerUser,
  googleLogin,
  facebookLogin,
} from "../../services/authServices";
import logo from "../../assets/logo.png"; // Import logo

const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | React.ReactNode>(
    ""
  );
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi
    if (!fullName.trim()) {
      setErrorMessage("Vui lòng nhập họ và tên");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("Vui lòng nhập email");
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Email không hợp lệ");
      return;
    }

    if (!phoneNumber.trim()) {
      setErrorMessage("Vui lòng nhập số điện thoại");
      return;
    }

    // Kiểm tra định dạng số điện thoại Việt Nam
    const phoneRegex = /^(0|\+84)(\d{9,10})$/;
    if (!phoneRegex.test(phoneNumber)) {
      setErrorMessage("Số điện thoại không hợp lệ");
      return;
    }

    if (!password) {
      setErrorMessage("Vui lòng nhập mật khẩu");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    // Hiển thị trạng thái đang xử lý
    setErrorMessage("");
    setSuccessMessage("Đang xử lý...");

    try {
      const authResponse = await registerUser({
        full_name: fullName,
        email,
        phone: phoneNumber,
        password,
      });

      if (authResponse.success && authResponse.data) {
        // Lưu token từ authResponse vào localStorage
        localStorage.setItem("accessToken", authResponse.data.accessToken);
        localStorage.setItem("refreshToken", authResponse.data.refreshToken);

        // Lưu email vào localStorage để trang OTP có thể lấy
        localStorage.setItem("pendingActivationEmail", email);

        // Thông báo đăng ký thành công và chuyển đến trang xác thực OTP
        setSuccessMessage(
          "Đăng ký thành công! Đang chuyển đến trang xác thực OTP..."
        );
        setErrorMessage("");
        console.log("Đăng ký thành công:", authResponse.data);

        // Chuyển hướng đến trang xác thực OTP sau 1.5 giây
        setTimeout(() => {
          navigate("/auth/verify-otp");
        }, 1500);
      } else {
        // Hiển thị thông báo lỗi cụ thể từ API

        // Xử lý riêng cho trường hợp email đã tồn tại
        if (authResponse.error?.error === "Email already exist") {
          setErrorMessage(
            <div>
              <p>{authResponse.error.message}</p>
              <p className="mt-2">
                <button
                  className="text-red-600 hover:text-red-800 font-semibold underline"
                  onClick={() => navigate("/login", { state: { email } })}
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          );
        } else {
          setErrorMessage(
            authResponse.error?.message ||
              "Đăng ký thất bại. Vui lòng thử lại sau."
          );
        }

        setSuccessMessage("");
      }
    } catch (error: unknown) {
      console.error("Chi tiết lỗi đăng ký:", error);

      if (axios.isAxiosError(error)) {
        // Lỗi API 400 - Bad Request
        if (error.response?.status === 400) {
          // Trích xuất thông báo lỗi từ response
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Thông tin đăng ký không hợp lệ";
          setErrorMessage(errorMessage);
        }
        // Lỗi 409 - Conflict (email đã tồn tại)
        else if (error.response?.status === 409) {
          setErrorMessage("Email hoặc số điện thoại đã được đăng ký");
        }
        // Lỗi server khác
        else {
          setErrorMessage(
            `Lỗi máy chủ: ${error.response?.data?.message || error.message}`
          );
        }
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đăng ký thất bại. Vui lòng thử lại sau.");
      }
      setSuccessMessage("");
    }
  };

  const handleGoogleLogin = async (credentialResponse: {
    credential?: string;
  }) => {
    if (!credentialResponse.credential) {
      console.error("Lỗi đăng nhập Google: Credential không hợp lệ");
      setErrorMessage("Đăng nhập Google thất bại");
      return;
    }

    try {
      const authResponse = await googleLogin(credentialResponse.credential);

      if (authResponse.success && authResponse.data) {
        localStorage.setItem("accessToken", authResponse.data.accessToken);
        localStorage.setItem("refreshToken", authResponse.data.refreshToken);

        setSuccessMessage("Đăng nhập Google thành công!");
        setErrorMessage("");
        console.log("Đăng nhập Google thành công:", authResponse.data);
        navigate("/");
      } else {
        setErrorMessage(
          authResponse.error?.message || "Đăng nhập Google thất bại"
        );
      }
    } catch (error: unknown) {
      console.error("Lỗi đăng nhập Google:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đăng nhập Google thất bại");
      }
    }
  };

  const handleFacebookLogin = async (response: { accessToken: string }) => {
    try {
      const authResponse = await facebookLogin(response.accessToken);

      if (authResponse.success && authResponse.data) {
        localStorage.setItem("accessToken", authResponse.data.accessToken);
        localStorage.setItem("refreshToken", authResponse.data.refreshToken);

        setSuccessMessage("Đăng nhập Facebook thành công!");
        setErrorMessage("");
        console.log("Đăng nhập Facebook thành công:", authResponse.data);
        navigate("/");
      } else {
        setErrorMessage(
          authResponse.error?.message || "Đăng nhập Facebook thất bại"
        );
      }
    } catch (error: unknown) {
      console.error("Lỗi đăng nhập Facebook:", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đăng nhập Facebook thất bại");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#800000] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center mb-6">
          {/* Logo hình tròn */}
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white p-1 shadow-lg mb-4">
            <img
              src={logo}
              alt="Cinema Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <h2 className="text-center text-3xl font-bold mb-2 text-gray-800">
            Tạo tài khoản
          </h2>
          <p className="text-center text-gray-600 mb-4">
            Đăng ký để trải nghiệm dịch vụ tốt nhất
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {typeof errorMessage === "string" ? errorMessage : errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            {successMessage}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Họ và tên
          </label>
          <input
            type="text"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

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

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            type="text"
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
          onClick={handleRegister}
          className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold"
        >
          ĐĂNG KÝ
        </button>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Đăng nhập
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
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Lỗi đăng nhập Google");
                setErrorMessage("Đăng nhập Google thất bại");
              }}
            />
            <FacebookLogin
              appId="YOUR_FACEBOOK_APP_ID"
              onSuccess={handleFacebookLogin}
              onFail={(error: unknown) => {
                console.error("Lỗi đăng nhập Facebook:", error);
                setErrorMessage("Đăng nhập Facebook thất bại");
              }}
              render={({ onClick }) => (
                <button
                  onClick={onClick}
                  className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <span className="font-medium">Facebook</span>
                </button>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
