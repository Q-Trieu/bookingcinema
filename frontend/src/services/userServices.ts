import axiosInstance from "./axiosInstance";

export interface User {
  id: number;
  full_name: string;
  avatar: string;
  email: string;
  password: string;
  phone: string;
  is_active: boolean;
  is_locked: boolean;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axiosInstance.get("/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

export const updateUser = async (): Promise<User> => {
  try {
    const response = await axiosInstance.put("/users");
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
}
