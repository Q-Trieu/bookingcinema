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
    const response = await axiosInstance.get("/showtime");

    // Lọc dữ liệu để loại bỏ các lịch chiếu có thời gian không hợp lệ
    const showtimes = response.data.data || [];
    const validShowtimes = showtimes.filter((showtime: Showtime) => {
      try {
        // Kiểm tra nếu startTime là chuỗi hợp lệ và tạo được đối tượng Date
        if (
          !showtime.startTime ||
          isNaN(new Date(showtime.startTime).getTime())
        ) {
          console.warn(
            "Bỏ qua lịch chiếu có startTime không hợp lệ:",
            showtime
          );
          return false;
        }

        // Kiểm tra tương tự cho endTime
        if (!showtime.endTime || isNaN(new Date(showtime.endTime).getTime())) {
          console.warn("Bỏ qua lịch chiếu có endTime không hợp lệ:", showtime);
          return false;
        }

        return true;
      } catch (error) {
        console.error("Lỗi xử lý thời gian cho lịch chiếu:", showtime, error);
        return false;
      }
    });

    return validShowtimes;
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    throw new Error("Failed to fetch showtimes");
  }
};
