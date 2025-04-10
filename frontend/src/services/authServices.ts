import axiosInstance from "./axiosInstance";

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
export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post("/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw new Error("Failed to log in");
  }
};
export const register = async (
  credentials: RegisterCredentials
): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post("/register", credentials);
    return response.data;
  } catch (error) {
    console.error("Error registering:", error);
    throw new Error("Failed to register");
  }
};
export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post("/logout");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  } catch (error) {
    console.error("Error logging out:", error);
    throw new Error("Failed to log out");
  }
};

export const FacebookLogin = async ( accessToken: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post("/auth/facebook", { accessToken });
    return response.data;
  } catch (error) {
    console.error("Error logging in with Facebook:", error);
    throw new Error("Failed to log in with Facebook");
  }
}
export const GoogleLogin = async ( accessToken: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post("/auth/google", { accessToken });
    return response.data;
  } catch (error) {
    console.error("Error logging in with Google:", error);
    throw new Error("Failed to log in with Google");
  }
}