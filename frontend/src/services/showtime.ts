import axiosInstance from "./axiosInstance";

export interface Showtime {
  id: number;
  movieId: number;
  cinemaId: number;
  startTime: string;
  endTime: string;
  availableSeats: number;
  totalSeats: number;
}

export const getShowtimes = async (): Promise<Showtime[]> => {
  try {
    const response = await axiosInstance.get("/showtimes?movieId=${movieId}");
    return response.data;
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    throw new Error("Failed to fetch showtimes");
  }
}
