import axiosInstance from "./axiosInstance";

export interface Seat {
  theaterId: string;
  seatNumber: string;
  status: string;
  type: string;
  price: number;
}
export const getAllSeats = async (showtimeId: string): Promise<Seat[]> => {
  try {
    const response = await axiosInstance.get(`/seats/${showtimeId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching seats:", error);
    throw new Error("Failed to fetch seats");
  }
};

export const updateSeatStatus = async (showtimeId: string, seatNumber: string, status: string): Promise<void> => {
  try {
    await axiosInstance.put(`/seats/${showtimeId}/${seatNumber}`, { status });
  } catch (error) {
    console.error("Error updating seat status:", error);
    throw new Error("Failed to update seat status");
  }
};
export const getSeatType = async (showtimeId: string, seatNumber: string): Promise<string> => {
  try {
    const response = await axiosInstance.get(`/seats/${showtimeId}/${seatNumber}`);
    return response.data.type;
  } catch (error) {
    console.error("Error fetching seat type:", error);
    throw new Error("Failed to fetch seat type");
  }
};
export const getSeatPrice = async (showtimeId: string, seatNumber: string): Promise<number> => {
  try {
    const response = await axiosInstance.get(`/seats/${showtimeId}/${seatNumber}`);
    return response.data.price;
  } catch (error) {
    console.error("Error fetching seat price:", error);
    throw new Error("Failed to fetch seat price");
  }
};
export const updateSeatPrice = async (showtimeId: string, seatNumber: string, price: number): Promise<void> => {
  try {
    await axiosInstance.put(`/seats/${showtimeId}/${seatNumber}`, { price });
  } catch (error) {
    console.error("Error updating seat price:", error);
    throw new Error("Failed to update seat price");
  }
};
export const updateSeatType = async (showtimeId: string, seatNumber: string, type: string): Promise<void> => {
  try {
    await axiosInstance.put(`/seats/${showtimeId}/${seatNumber}`, { type });
  }
  catch (error) {
    console.error("Error updating seat type:", error);
    throw new Error("Failed to update seat type");
  }
}
