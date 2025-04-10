// src/components/OTPPage.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp, verifyOtp, resendOtp } from "../../services/otpServices";
import axios from "axios";

const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  // "email" khi người dùng nhập email nhận OTP
  // "otp" khi đã gửi OTP và người dùng cần nhập mã để xác thực
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0); // Đếm ngược thời gian gửi lại OTP

  // Dùng để chuyển focus giữa các input mã OTP
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // -----------------
  // Gửi OTP tới email nhập từ người dùng
  const handleSendOtp = useCallback(
    async (emailToUse = email) => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        await sendOtp(emailToUse);
        setMessage("OTP đã được gửi tới email của bạn.");
        setStep("otp");
        setCountdown(60); // Đặt thời gian đếm ngược 60 giây
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          setError(
            (error.response.data as { message?: string }).message ||
              "Lỗi khi gửi OTP"
          );
        } else if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Có lỗi xảy ra, vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  // Tự động lấy email từ localStorage khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingActivationEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      // Tự động gửi OTP nếu có email
      handleSendOtp(savedEmail);
    }
  }, [handleSendOtp]);

  // Đếm ngược thời gian gửi lại OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    if (value && !/^[a-zA-Z0-9]$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasteData = event.clipboardData.getData("text").trim();
    const pastedCharacters = pasteData.slice(0, 6).split("");

    const newOtp = [...otp];
    pastedCharacters.forEach((char, i) => {
      if (/^[a-zA-Z0-9]$/.test(char)) {
        newOtp[i] = char;
      }
    });
    setOtp(newOtp);

    const lastIndex =
      pastedCharacters.length >= 6 ? 5 : pastedCharacters.length;
    inputRefs.current[lastIndex]?.focus();
  };

  // -----------------
  // Xác thực OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await verifyOtp(email, otpCode);
      setMessage("OTP xác thực thành công! Đang chuyển hướng...");

      // Xóa email khỏi localStorage sau khi xác thực thành công
      localStorage.removeItem("pendingActivationEmail");

      // Chuyển hướng người dùng sau khi xác thực thành công
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setError(
          (error.response.data as { message?: string }).message ||
            "Xác thực OTP thất bại"
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -----------------
  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return; // Ngăn không cho gửi lại nếu đang trong thời gian chờ

    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await resendOtp(email);
      setMessage("OTP đã được gửi lại tới email của bạn.");
      // Reset lại vùng nhập mã OTP
      setOtp(new Array(6).fill(""));
      setCountdown(60); // Đặt lại thời gian đếm ngược
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        setError(
          (error.response.data as { message?: string }).message ||
            "Gửi lại OTP thất bại"
        );
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#800000] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <img
            src="/assets/gif/NỀN.gif"
            alt="Banner OTP"
            className="w-full rounded"
          />
          <h2 className="text-3xl font-bold mt-4 text-gray-800">
            Xác thực tài khoản
          </h2>
          <p className="text-gray-600 mt-2">
            Vui lòng nhập email của bạn để nhận mã OTP
          </p>
        </div>

        {step === "email" && (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
                {message}
              </div>
            )}
            <button
              onClick={() => handleSendOtp()}
              disabled={loading || !email}
              className={`w-full p-3 rounded transition-colors ${
                loading || !email
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {loading ? "Đang xử lý..." : "Gửi OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="text-center mb-2">
              <p className="text-gray-700">
                OTP được gửi đến: <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((value, index) => (
                <input
                  key={index}
                  type="text"
                  value={value}
                  maxLength={1}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleInputChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 border border-gray-300 rounded text-center text-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              ))}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
                {message}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.some((digit) => digit === "")}
              className={`w-full p-3 rounded transition-colors font-semibold ${
                loading || otp.some((digit) => digit === "")
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {loading ? "Đang xử lý..." : "Xác nhận OTP"}
            </button>

            <div className="mt-4 text-center">
              <button
                onClick={handleResendOtp}
                disabled={loading || countdown > 0}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                {countdown > 0
                  ? `Gửi lại OTP sau ${countdown}s`
                  : "Gửi lại OTP"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OTPPage;
