import axiosInstance from "./axiosInstance";

export interface Cinema {
  id: number;
  name: string;
  location: string;
  totalScreens: number;
  contactNumber: string;
  email: string;
}

export const getCinemas = async (): Promise<Cinema[]> => {
  try {
    const response = await axiosInstance.get("/cinemas");
    return response.data;
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    throw new Error("Failed to fetch cinemas");
  }
}
