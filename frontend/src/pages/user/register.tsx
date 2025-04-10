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

const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      const authResponse = await registerUser({
        full_name: fullName,
        email,
        phone: phoneNumber,
        password,
      });
      // Lưu token từ authResponse vào localStorage
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("refreshToken", authResponse.refreshToken);

      // Lưu email để trang OTP có thể sử dụng
      localStorage.setItem("pendingActivationEmail", email);

      setSuccessMessage("Đăng ký thành công! Chuyển đến trang xác thực OTP...");
      setErrorMessage("");
      console.log("Đăng ký thành công:", authResponse);

      // Chuyển hướng đến trang OTP sau 1.5 giây
      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Đăng ký thất bại");
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
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("refreshToken", authResponse.refreshToken);

      setSuccessMessage("Đăng nhập Google thành công!");
      setErrorMessage("");
      console.log("Đăng nhập Google thành công:", authResponse);
      navigate("/");
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
      localStorage.setItem("accessToken", authResponse.accessToken);
      localStorage.setItem("refreshToken", authResponse.refreshToken);

      setSuccessMessage("Đăng nhập Facebook thành công!");
      setErrorMessage("");
      console.log("Đăng nhập Facebook thành công:", authResponse);
      navigate("/");
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
        <div className="text-center mb-6">
          <img
            src="/assets/gif/NỀN.gif"
            alt="Characters"
            className="w-full rounded"
          />
        </div>

        <h2 className="text-center text-3xl font-bold mb-6 text-gray-800">
          Tạo tài khoản
        </h2>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {errorMessage}
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
