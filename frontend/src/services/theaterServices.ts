import axiosInstance from "./axiosInstance";

export interface theater {
  id: number;
  name: string;
  location: string;
  totalScreens: number;
  contactNumber: string;
  email: string;
}

export const getTheaters = async (): Promise<theater[]> => {
  try {
    const response = await axiosInstance.get("/cinemas");
    return response.data;
  } catch (error) {
    console.error("Error fetching cinemas:", error);
    throw new Error("Failed to fetch cinemas");
  }
}
