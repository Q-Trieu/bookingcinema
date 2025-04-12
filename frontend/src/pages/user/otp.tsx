// src/components/OTPPage.tsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  verifyAccount,
  verifyAccountAlternative,
  resendVerificationOtp,
  verifyAccountSimple,
} from "../../services/authServices";

const OTPPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Tự động lấy email từ localStorage khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("pendingActivationEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      // Bắt đầu đếm ngược để hiển thị khi nào có thể gửi lại OTP
      setCountdown(60);
    } else {
      // Nếu không có email, chuyển hướng về trang đăng nhập
      setError("Không tìm thấy email để xác thực. Vui lòng đăng nhập lại.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
  }, [navigate]);

  // Đếm ngược cho nút gửi lại OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Xử lý nhập OTP
  const handleInputChange = (index: number, value: string) => {
    if (value && !/^[0-9]$/.test(value)) return; // Chỉ cho phép nhập số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động chuyển đến ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Nếu đã điền đủ 6 số và đang ở ô cuối cùng, tự động submit
    if (value && index === 5 && newOtp.every((digit) => digit !== "")) {
      setTimeout(() => handleVerifyOtp(), 300);
    }
  };

  // Xử lý khi xóa số
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Nếu nhấn Backspace và ô hiện tại trống, focus vào ô trước đó
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Xử lý dán mã OTP
  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text").trim();
    const pastedOtp = pastedData.slice(0, 6).split("");

    if (pastedOtp.length <= 6) {
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (/^[0-9]$/.test(char)) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp);

      // Focus vào ô cuối cùng được điền
      const lastIndex = Math.min(pastedOtp.length - 1, 5);
      if (lastIndex >= 0) {
        inputRefs.current[lastIndex]?.focus();
      }

      // Nếu đã điền đủ 6 số, tự động submit sau một khoảng thời gian ngắn
      if (newOtp.every((digit) => digit !== "") && newOtp.length === 6) {
        setTimeout(() => handleVerifyOtp(), 300);
      }
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }

    console.log(otpCode);
    console.log(typeof otpCode);

    // Nếu đang xử lý, không cho phép gửi lại request
    if (loading) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Hiển thị thông báo đang xác thực
    setSuccessMessage("Đang xác thực mã OTP...");

    try {
      // Log thông tin xác thực để debug
      console.log("OTP verification attempt:");
      console.log("Email:", email);
      console.log("OTP code:", otpCode);

      // Thử phương pháp xác thực đơn giản nhất
      try {
        console.log("Trying simple verification method first...");
        const simpleResult = await verifyAccountSimple(email, otpCode);
        console.log("Simple verification result:", simpleResult);

        if (simpleResult.success) {
          handleVerificationSuccess();
          return;
        } else {
          console.log("Simple verification failed, trying standard method...");
        }
      } catch (simpleError) {
        console.error("Error in simple verification:", simpleError);
      }

      // Thử phương pháp xác thực thứ nhất
      try {
        console.log("Trying standard verification method...");
        const result = await verifyAccount(email, otpCode);
        console.log("Standard verification result:", result);

        if (result.success) {
          handleVerificationSuccess();
          return;
        } else {
          // Nếu lỗi là OTP không tìm thấy trong session, có thể session đã hết hạn
          if (result.error?.error === "OTPNotFound") {
            console.log("OTP not found in session, trying to reset session...");

            // Thử gửi lại OTP để tạo session mới
            await resendVerificationOtp(email);

            setError(
              "Phiên làm việc đã hết hạn. Chúng tôi đã gửi lại mã OTP mới, vui lòng kiểm tra email và nhập mã mới."
            );

            // Xóa OTP đã nhập để người dùng nhập mã mới
            setOtp(Array(6).fill(""));
            inputRefs.current[0]?.focus();
            setLoading(false);
            return;
          }

          console.log(
            "Standard verification failed, trying alternative method..."
          );
        }
      } catch (standardError) {
        console.error("Error in standard verification:", standardError);
        console.log("Falling back to alternative method...");
      }

      // Nếu phương pháp đầu tiên thất bại, thử phương pháp thứ hai
      const alternativeResult = await verifyAccountAlternative(email, otpCode);
      console.log("Alternative verification result:", alternativeResult);

      if (alternativeResult.success) {
        handleVerificationSuccess();
      } else {
        // Xử lý lỗi từ API
        setSuccessMessage(null); // Xóa thông báo đang xác thực

        // Lấy thông tin lỗi chi tiết
        const errorMessage =
          alternativeResult.error?.message ||
          "Xác thực OTP thất bại. Vui lòng thử lại.";
        const errorCode = alternativeResult.error?.error;
        const statusCode = alternativeResult.error?.statusCode;

        console.error("Verification error:", {
          message: errorMessage,
          error: errorCode,
          statusCode,
        });

        // Xử lý các trường hợp lỗi cụ thể
        if (errorCode === "OTPNotFound") {
          // Thử gửi lại OTP tự động
          try {
            await resendVerificationOtp(email);
            setError(
              "Phiên làm việc đã hết hạn. Chúng tôi đã gửi lại mã OTP mới, vui lòng kiểm tra email và nhập mã mới."
            );
          } catch (resendError) {
            console.error("Error resending OTP:", resendError);
            setError(
              "Mã OTP không tìm thấy. Vui lòng nhấn nút 'Gửi lại OTP' để nhận mã mới."
            );
          }
        } else if (errorCode === "OTPExpired") {
          setError("Mã OTP đã hết hạn. Vui lòng gửi lại OTP mới.");
        } else {
          setError(errorMessage);
        }

        // Nếu lỗi liên quan đến OTP, focus vào ô đầu tiên để dễ nhập lại
        if (
          errorCode === "InvalidOtp" ||
          errorCode === "OTPNotFound" ||
          errorCode === "OTPExpired" ||
          (statusCode === 400 && errorMessage.includes("OTP"))
        ) {
          inputRefs.current[0]?.focus();
          setOtp(Array(6).fill(""));
        }
      }
    } catch (error) {
      console.error("Lỗi xác thực OTP:", error);
      setSuccessMessage(null); // Xóa thông báo đang xác thực

      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log("Error response data:", error.response.data);
          console.log("Error response status:", error.response.status);
          console.log("Error response headers:", error.response.headers);

          if (error.response.status === 400) {
            // Kiểm tra xem có phải lỗi liên quan đến session không
            const errorMessage = error.response.data?.error || "";
            if (
              errorMessage.includes("not found") ||
              errorMessage.includes("expired")
            ) {
              // Thử gửi lại OTP tự động
              try {
                await resendVerificationOtp(email);
                setError(
                  "Phiên làm việc đã hết hạn. Chúng tôi đã gửi lại mã OTP mới, vui lòng kiểm tra email và nhập mã mới."
                );
              } catch (resendError) {
                console.error("Error auto-resending OTP:", resendError);
                setError(
                  "Mã OTP không đúng hoặc đã hết hạn. Vui lòng gửi lại OTP."
                );
              }
            } else {
              setError("Mã OTP không đúng hoặc đã hết hạn");
            }
            // Tự động focus vào ô đầu tiên để dễ nhập lại
            inputRefs.current[0]?.focus();
            setOtp(Array(6).fill(""));
          } else if (error.response.status === 404) {
            setError(
              "API xác thực OTP không tồn tại. Vui lòng liên hệ quản trị viên."
            );
          } else {
            // Hiển thị thông báo lỗi từ API nếu có
            const errorMessage =
              error.response.data?.message ||
              error.response.data?.error ||
              "Xác thực OTP thất bại. Vui lòng thử lại.";
            setError(errorMessage);
          }
        } else if (error.request) {
          setError(
            "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          setError(`Lỗi: ${error.message}`);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Đã có lỗi xảy ra khi xác thực OTP. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi xác thực thành công
  const handleVerificationSuccess = () => {
    // Cập nhật thông báo thành công
    setSuccessMessage(
      "Xác thực OTP thành công! Tài khoản của bạn đã được kích hoạt."
    );

    // Xóa email khỏi localStorage sau khi xác thực thành công
    localStorage.removeItem("pendingActivationEmail");

    // Cập nhật trạng thái đã xác thực cho tài khoản
    const verifiedAccounts = JSON.parse(
      localStorage.getItem("verifiedAccounts") || "[]"
    );
    if (!verifiedAccounts.includes(email)) {
      verifiedAccounts.push(email);
      localStorage.setItem(
        "verifiedAccounts",
        JSON.stringify(verifiedAccounts)
      );
    }

    // Chuyển về trang chủ sau khi xác thực thành công
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return; // Ngăn chặn người dùng spam gửi lại OTP

    setLoading(true);
    setError(null);
    setSuccessMessage("Đang gửi lại mã OTP...");

    try {
      // Gọi API gửi lại OTP
      const result = await resendVerificationOtp(email);

      if (result.success) {
        // Kiểm tra nếu response có chứa OTP (chỉ trong môi trường development)
        if (result.data?.otp) {
          setSuccessMessage(
            `Đã gửi lại mã OTP: ${result.data.otp}. Vui lòng kiểm tra email của bạn hoặc sử dụng mã này.`
          );

          // Tự động điền OTP vào form nếu có trong response
          const otpDigits = result.data.otp.toString().split("");
          if (otpDigits.length === 6) {
            setOtp(otpDigits);
          }
        } else {
          setSuccessMessage(
            "Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn."
          );
        }

        setCountdown(60); // Reset đếm ngược 60 giây

        // Focus vào ô đầu tiên để dễ nhập nếu không tự động điền
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        // Xử lý lỗi từ API
        setSuccessMessage(null);
        setError(
          result.error?.message || "Không thể gửi lại OTP. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error("Lỗi gửi lại OTP:", error);
      setSuccessMessage(null);

      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            setError("Email không tồn tại trong hệ thống");
          } else if (error.response.status === 429) {
            setError(
              "Bạn đã yêu cầu gửi OTP quá nhiều lần. Vui lòng đợi một lát."
            );
          } else {
            const errorMessage =
              error.response.data?.message ||
              error.response.data?.error ||
              "Không thể gửi lại OTP. Vui lòng thử lại.";
            setError(errorMessage);
          }
        } else if (error.request) {
          setError(
            "Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          setError(`Lỗi: ${error.message}`);
        }
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Đã có lỗi xảy ra khi gửi lại OTP. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý quay lại trang chính
  const handleGoToHome = () => {
    localStorage.removeItem("pendingActivationEmail");
    navigate("/");
  };

  // Xử lý quay lại đăng nhập
  const handleGoToLogin = () => {
    localStorage.removeItem("pendingActivationEmail");
    navigate("/login");
  };


  return (
    <div className="min-h-screen bg-[#800000] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Xác thực tài khoản
          </h2>
          <p className="text-gray-600 mt-2 mb-6">
            Vui lòng nhập mã OTP 6 số đã được gửi đến email của bạn để kích hoạt
            tài khoản
          </p>

          {email && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6 text-center">
              <p>
                Email đăng ký: <span className="font-semibold">{email}</span>
              </p>
            </div>
          )}

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

          <div className="flex justify-center space-x-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                className="w-12 h-14 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.some((digit) => !digit)}
            className={`w-full py-3 px-4 rounded-md text-white font-semibold ${
              loading || otp.some((digit) => !digit)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Đang xử lý..." : "Xác thực OTP"}
          </button>

          <div className="mt-4">
            <button
              onClick={handleResendOtp}
              disabled={loading || countdown > 0}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              {countdown > 0 ? `Gửi lại OTP sau ${countdown}s` : "Gửi lại OTP"}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap justify-between">
            <button
              onClick={handleGoToLogin}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Quay lại đăng nhập
            </button>

            <button
              onClick={handleGoToHome}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
