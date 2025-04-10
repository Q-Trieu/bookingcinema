import axiosInstance from "./axiosInstance";

export const sendOtp = async (email: string): Promise<void> => {
  try {
    await axiosInstance.post("/otp/send", { email });
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  try {
    await axiosInstance.post("/otp/verify", { email, otp });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw new Error("Failed to verify OTP");
  }
}

export const resendOtp = async (email: string): Promise<void> => {
  try {
    await axiosInstance.post("/otp/resend", { email });
  } catch (error) {
    console.error("Error resending OTP:", error);
    throw new Error("Failed to resend OTP");
  }
}