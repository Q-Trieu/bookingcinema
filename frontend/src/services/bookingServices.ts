import axiosInstance from "./axiosInstance";

export interface Booking{
  movieId: number;
  cinemaId: number;
  showtimeId: number;
  selectedSeats: number[];
  userId: number;
  totalPrice: number;
  bookingDate: string;
}

export interface BookingResponse {
  id: number;
  movieId: number;
  cinemaId: number;
  showtimeId: number;
  selectedSeats: number[];
  userId: number;
  totalPrice: number;  
  bookingDate: string;  
  status: string;
}
export const createBooking = async (bookingData: Booking): Promise<BookingResponse > => {
  try {
    const response = await axiosInstance.post("/bookings", bookingData);
    return response.data;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw new Error("Failed to create booking");
  }
};