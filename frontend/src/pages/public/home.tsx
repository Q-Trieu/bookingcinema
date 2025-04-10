import React, { useState, useEffect } from "react";
import { getMovies, Movie } from "../../services/movieServices";
import { getShowtimes } from "../../services/showtime";
import { Spin, Empty, Select, Rate, Row, Col, Space, Button } from "antd";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FilterOutlined,
} from "@ant-design/icons";

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
  duration?: number;
}

const Home: React.FC = () => {
  const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieWithShowtimes[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [activeDate, setActiveDate] = useState<string>("");

  // Bộ lọc
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [releaseYears, setReleaseYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesData, showtimes] = await Promise.all([
          getMovies(),
          getShowtimes(),
        ]);

        // Tạo mảng các ngày duy nhất từ dữ liệu lịch chiếu
        const showtimeDates = showtimes.map((st) => {
          const date = new Date(st.startTime);
          return date.toISOString().split("T")[0];
        });

        // Lấy các ngày duy nhất và sắp xếp
        const uniqueDates = [...new Set(showtimeDates)].sort();

        // Nếu không có dữ liệu ngày, tạo 7 ngày từ hôm nay
        if (uniqueDates.length === 0) {
          const today = new Date();
          const dates = Array.from({ length: 7 }, (_, i) => {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            return date.toISOString().split("T")[0];
          });
          setActiveDates(dates);
          setActiveDate(dates[0]);
        } else {
          setActiveDates(uniqueDates);
          setActiveDate(uniqueDates[0]);
        }

        // Kết hợp dữ liệu phim với lịch chiếu
        const moviesWithShowtimes = moviesData
          .filter((movie) => movie.status === "showing")
          .map((movie) => {
            const movieShowtimes: { [date: string]: MovieShowtime[] } = {};

            // Nhóm lịch chiếu theo ngày
            showtimes.forEach((st) => {
              if (st.movieId === movie.id) {
                const date = new Date(st.startTime);
                const dateStr = date.toISOString().split("T")[0];
                const timeStr = date
                  .toTimeString()
                  .split(" ")[0]
                  .substring(0, 5);

                // Lấy tên rạp dựa vào cinemaId
                const theater = `Rạp ${st.cinemaId}`;

                if (!movieShowtimes[dateStr]) {
                  movieShowtimes[dateStr] = [];
                }

                movieShowtimes[dateStr].push({
                  time: timeStr,
                  theater: theater,
                });
              }
            });

            return {
              ...movie,
              showtimes: movieShowtimes,
            };
          });

        // Lấy danh sách thể loại duy nhất
        const uniqueGenres = [
          ...new Set(moviesWithShowtimes.map((movie) => movie.genre)),
        ];
        setGenres(uniqueGenres);

        // Lấy danh sách năm phát hành duy nhất
        const years = [
          ...new Set(
            moviesWithShowtimes.map((movie) => {
              const releaseDate = new Date(movie.releaseDate);
              return releaseDate.getFullYear();
            })
          ),
        ];
        setReleaseYears(years.sort((a, b) => b - a)); // Sắp xếp giảm dần

        setMovies(moviesWithShowtimes);
        setFilteredMovies(moviesWithShowtimes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let result = [...movies];

    // Lọc theo thể loại
    if (selectedGenre) {
      result = result.filter((movie) => movie.genre === selectedGenre);
    }

    // Lọc theo năm phát hành
    if (selectedYear) {
      result = result.filter((movie) => {
        const releaseDate = new Date(movie.releaseDate);
        return releaseDate.getFullYear() === selectedYear;
      });
    }

    // Lọc theo rating
    if (selectedRating !== null) {
      result = result.filter(
        (movie) =>
          movie.rating >= selectedRating && movie.rating < selectedRating + 1
      );
    }

    setFilteredMovies(result);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedGenre("");
    setSelectedYear(null);
    setSelectedRating(null);
    setFilteredMovies(movies);
  };

  // Format date để hiển thị
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const weekdays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    const weekday = weekdays[date.getDay()];

    return {
      full: `${day}/${month}`,
      weekday,
      isToday: dateString === activeDates[0],
    };
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
        <h1 className="text-3xl font-bold text-center mb-8">PHIM ĐANG CHIẾU</h1>

        {/* Filter section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Lọc phim</h2>
            <Button
              type="text"
              icon={<FilterOutlined />}
              onClick={() => setShowFilters(!showFilters)}
              className="text-white hover:text-yellow-400"
            >
              {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
            </Button>
          </div>

          {showFilters && (
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div className="mb-2">Thể loại:</div>
                  <Select
                    placeholder="Chọn thể loại"
                    style={{ width: "100%" }}
                    value={selectedGenre || undefined}
                    onChange={(value) => setSelectedGenre(value)}
                    allowClear
                  >
                    {genres.map((genre) => (
                      <Option key={genre} value={genre}>
                        {genre}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <div className="mb-2">Năm phát hành:</div>
                  <Select
                    placeholder="Chọn năm"
                    style={{ width: "100%" }}
                    value={selectedYear || undefined}
                    onChange={(value) => setSelectedYear(value)}
                    allowClear
                  >
                    {releaseYears.map((year) => (
                      <Option key={year} value={year}>
                        {year}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={8}>
                  <div className="mb-2">Đánh giá:</div>
                  <Rate
                    value={selectedRating || 0}
                    onChange={(value) => setSelectedRating(value)}
                  />
                </Col>
              </Row>
              <Row className="mt-4">
                <Col span={24}>
                  <Space>
                    <Button type="primary" onClick={applyFilters}>
                      Lọc phim
                    </Button>
                    <Button onClick={resetFilters}>Xóa bộ lọc</Button>
                  </Space>
                </Col>
              </Row>
            </div>
          )}
        </div>

        {/* Date selector */}
        <div className="flex overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <div className="flex space-x-2">
            {activeDates.map((date) => {
              const { full, weekday, isToday } = formatDate(date);
              return (
                <button
                  key={date}
                  onClick={() => setActiveDate(date)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg flex flex-col items-center transition-colors ${
                    activeDate === date
                      ? "bg-yellow-500 text-black"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <span className="font-bold">{weekday}</span>
                  <span>{full}</span>
                  {isToday && <span className="text-xs">Hôm nay</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Movie list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMovies.length > 0 ? (
            filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
              >
                <img
                  src={movie.posterUrl || "https://via.placeholder.com/300x450"}
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

                  <div className="flex items-center text-sm mb-4">
                    <span className="flex items-center mr-4">
                      <CalendarOutlined className="mr-1" />
                      {movie.releaseDate}
                    </span>
                    <span className="flex items-center">
                      <ClockCircleOutlined className="mr-1" />
                      {movie.duration || 120} phút
                    </span>
                  </div>

                  <div className="flex items-center mb-4">
                    <span className="mr-2">Thể loại: {movie.genre}</span>
                    <span className="ml-auto">
                      <Rate disabled defaultValue={movie.rating} />
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Suất chiếu:</h4>
                    <div className="flex flex-wrap gap-2">
                      {movie.showtimes[activeDate]?.map((showtime, idx) => (
                        <Link
                          key={idx}
                          to={`/booking/${movie.id}?date=${activeDate}&time=${showtime.time}&theater=${showtime.theater}`}
                          className="px-3 py-1 bg-red-900 rounded hover:bg-red-800 text-sm flex flex-col items-center"
                        >
                          <span>{showtime.time}</span>
                          <span className="text-xs">{showtime.theater}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/movies/${movie.id}`}
                    className="block w-full text-center py-2 bg-yellow-500 text-black rounded-md font-medium hover:bg-yellow-400 transition-colors"
                  >
                    Chi tiết phim
                  </Link>
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

      <Footer />
    </div>
  );
};

export default Home;
