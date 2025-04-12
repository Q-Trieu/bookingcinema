import React, { useState, useEffect } from "react";
import { getMovies, Movie } from "../../services/movieServices";
import { getShowtimes } from "../../services/showtime";
import { Spin, Empty } from "antd";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";

// Interface cho lịch chiếu
interface MovieShowtime {
  time: string;
  theater: string;
}

// Phim với lịch chiếu theo ngày
interface MovieWithShowtimes extends Movie {
  showtimes: {
    [date: string]: MovieShowtime[];
  };
  duration?: number;
}

const Home: React.FC = () => {
  const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesData, showtimes] = await Promise.all([
          getMovies(),
          getShowtimes(),
        ]);

        // Tạo mảng các ngày trong tuần
        const today = new Date();
        const startOfWeek = today.getDate() - today.getDay(); // Chủ nhật
        const weekDates = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(startOfWeek + i);
          return date.toISOString().split("T")[0];
        });

        // Kết hợp dữ liệu phim với lịch chiếu
        const moviesWithShowtimes = moviesData
          .filter((movie) => movie.status === "active")
          .map((movie) => {
            const movieShowtimes: { [date: string]: MovieShowtime[] } = {};

            // Nhóm lịch chiếu theo ngày
            showtimes.forEach((st) => {
              if (st.movieId === movie.id) {
                const date = new Date(st.startTime);
                const dateStr = date.toISOString().split("T")[0];

                // Chỉ lấy lịch chiếu trong tuần
                if (weekDates.includes(dateStr)) {
                  const timeStr = date
                    .toTimeString()
                    .split(" ")[0]
                    .substring(0, 5);
                  const theater = `Rạp ${st.cinemaId}`;

                  if (!movieShowtimes[dateStr]) {
                    movieShowtimes[dateStr] = [];
                  }

                  movieShowtimes[dateStr].push({
                    time: timeStr,
                    theater: theater,
                  });
                }
              }
            });

            return {
              ...movie,
              showtimes: movieShowtimes,
            };
          })
          .filter((movie) => Object.keys(movie.showtimes).length > 0); // Chỉ lấy phim có lịch chiếu

        setMovies(moviesWithShowtimes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#800000]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-[#800000] text-white min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          PHIM ĐANG CHIẾU TRONG TUẦN
        </h1>

        {/* Movie list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
              >
                <img
                  src={movie.poster || "https://via.placeholder.com/300x450"}
                  alt={movie.title}
                  className="w-full h-64 object-cover object-center"
                />

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2 truncate">
                    {movie.title}
                  </h3>
                  <p className="text-gray-400 mb-2 line-clamp-2">
                    {movie.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Suất chiếu:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(movie.showtimes).map(
                        ([date, showtimes]) =>
                          showtimes.map((showtime, idx) => (
                            <Link
                              key={idx}
                              to={`/booking/${movie.id}?date=${date}&time=${showtime.time}&theater=${showtime.theater}`}
                              className="px-3 py-1 bg-red-900 rounded hover:bg-red-800 text-sm flex flex-col items-center"
                            >
                              <span>{showtime.time}</span>
                              <span className="text-xs">
                                {showtime.theater}
                              </span>
                            </Link>
                          ))
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/movie/${movie.id}`}
                    className="block w-full text-center py-2 bg-yellow-500 text-black rounded-md font-medium hover:bg-yellow-400 transition-colors"
                  >
                    Chi tiết phim
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex justify-center">
              <Empty description="Không có phim nào đang chiếu trong tuần" />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
