import React, { useState, useEffect } from "react";
import { useAuth } from "../../hook/useAuth";
import { getMovies, Movie } from "../../services/movieServices";
import { getShowtimes } from "../../services/showtime";
import { Button, Typography, Spin, Select, Empty, Modal, message } from "antd";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

const { Option } = Select;

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
  genres?: string[];
}

const MoviePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieWithShowtimes[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [dates, setDates] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [deleteModalVisible, setDeleteModalVisible] = useState<boolean>(false);
  const [movieToDelete, setMovieToDelete] = useState<string | null>(null);

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

        setDates(weekDates);

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
              genres: movie.genre?.split(",").map((g) => g.trim()) || [],
            };
          })
          .filter((movie) => Object.keys(movie.showtimes).length > 0); // Chỉ lấy phim có lịch chiếu

        // Lấy tất cả thể loại phim
        const allGenres = new Set<string>();
        moviesWithShowtimes.forEach((movie) => {
          movie.genres?.forEach((genre) => {
            allGenres.add(genre);
          });
        });

        setGenres(Array.from(allGenres));
        setMovies(moviesWithShowtimes);
        setFilteredMovies(moviesWithShowtimes);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Lọc phim theo ngày và thể loại
    let filtered = [...movies];

    if (selectedDate) {
      filtered = filtered.filter(
        (movie) =>
          movie.showtimes[selectedDate] &&
          movie.showtimes[selectedDate].length > 0
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter((movie) =>
        movie.genres?.includes(selectedGenre)
      );
    }

    setFilteredMovies(filtered);
  }, [selectedDate, selectedGenre, movies]);

  const handleDateChange = (value: string) => {
    setSelectedDate(value);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
  };

  const showDeleteConfirm = (movieId: string) => {
    setMovieToDelete(movieId);
    setDeleteModalVisible(true);
  };

  const handleDeleteMovie = async () => {
    if (movieToDelete) {
      try {
        // Gọi API xóa phim ở đây
        // await deleteMovie(movieToDelete);

        message.success("Xóa phim thành công");
        // Cập nhật danh sách phim sau khi xóa
        setMovies(movies.filter((movie) => movie.id !== Number(movieToDelete)));
        setFilteredMovies(
          filteredMovies.filter((movie) => movie.id !== Number(movieToDelete))
        );
      } catch (error) {
        console.error("Lỗi khi xóa phim:", error);
        message.error("Không thể xóa phim");
      } finally {
        setDeleteModalVisible(false);
        setMovieToDelete(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
    });
  };

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

        {/* Bộ lọc */}
        <div className="mb-8 flex flex-wrap gap-4 justify-center">
          <div className="w-full md:w-auto">
            <Typography.Text className="text-white mr-2">
              Lọc theo ngày:
            </Typography.Text>
            <Select
              placeholder="Chọn ngày"
              style={{ width: 200 }}
              onChange={handleDateChange}
              value={selectedDate || undefined}
              allowClear
              className="text-black"
            >
              {dates.map((date) => (
                <Option key={date} value={date}>
                  {formatDate(date)}
                </Option>
              ))}
            </Select>
          </div>

          <div className="w-full md:w-auto">
            <Typography.Text className="text-white mr-2">
              Lọc theo thể loại:
            </Typography.Text>
            <Select
              placeholder="Chọn thể loại"
              style={{ width: 200 }}
              onChange={handleGenreChange}
              value={selectedGenre || undefined}
              allowClear
              className="text-black"
            >
              {genres.map((genre) => (
                <Option key={genre} value={genre}>
                  {genre}
                </Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Danh sách phim */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
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

                  <div className="mb-2">
                    <span className="text-sm text-gray-400">Thể loại: </span>
                    <span className="text-sm">{movie.genres?.join(", ")}</span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Suất chiếu:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(movie.showtimes).map(
                        ([date, showtimes]) =>
                          (!selectedDate || selectedDate === date) &&
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
                    to={`/movieDetail/${movie.id}`}
                    className="block w-full text-center py-2 bg-yellow-500 text-black rounded-md font-medium hover:bg-yellow-400 transition-colors mb-2"
                  >
                    Chi tiết phim
                  </Link>

                  {isAdmin() && (
                    <div className="flex space-x-2 mt-2">
                      <Button
                        type="primary"
                        icon={<EditOutlined />}
                        className="flex-1 bg-blue-500"
                      >
                        Cập nhật
                      </Button>
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        className="flex-1"
                        onClick={() => showDeleteConfirm(String(movie.id))}
                      >
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 flex justify-center">
              <Empty description="Không có phim nào phù hợp với bộ lọc" />
            </div>
          )}
        </div>
      </div>

      <Modal
        title="Xác nhận xóa phim"
        open={deleteModalVisible}
        onOk={handleDeleteMovie}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa phim này không?</p>
      </Modal>

      <Footer />
    </div>
  );
};

export default MoviePage;
