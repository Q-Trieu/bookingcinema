// src/components/LoginForm.tsx

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import FacebookLogin from "@greatsumini/react-facebook-login";
import { GoogleLogin } from "@react-oauth/google";
import { login, facebookLogin, googleLogin } from "../../services/authServices"; // Đảm bảo đường dẫn đúng

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });

      // Lưu token vào localStorage theo key đã định nghĩa trong axiosInstance
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);

      setSuccessMessage("Đăng nhập thành công!");
      setError("");
      console.log("Đăng nhập thành công:", response);

      // Chuyển hướng sau khi đăng nhập thành công
      navigate("/");
    } catch (err: unknown) {
      console.error("Lỗi đăng nhập:", err);
      setError("Đăng nhập thất bại");
      setSuccessMessage("");
    }
  };

  const handleFacebookLogin = async (response: { accessToken: string }) => {
    try {
      const res = await facebookLogin(response.accessToken);

      // Lưu token vào localStorage
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

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
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("refreshToken", res.refreshToken);

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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
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
          className="w-full p-3 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-semibold"
        >
          ĐĂNG NHẬP
        </button>

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
