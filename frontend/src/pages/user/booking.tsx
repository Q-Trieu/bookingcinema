import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  getMovieDetails,
  MovieDetails as MovieDetailsType,
} from "../../services/movieServices";
import { getShowtimes } from "../../services/showtime";
import {
  Button,
  Typography,
  Spin,
  message,
  Card,
  Row,
  Col,
  Divider,
  Radio,
  Space,
} from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Seat {
  id: string;
  row: string;
  number: number;
  status: "available" | "reserved" | "selected";
  price: number;
}

interface Showtime {
  id: number;
  startTime: string;
  cinemaId: number;
  movieId: number;
  availableSeats: number;
  totalSeats: number;
}

const Booking: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const date = queryParams.get("date") || "";
  const initialTime = queryParams.get("time") || "";
  const initialTheater = queryParams.get("theater") || "";

  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const [availableTimes, setAvailableTimes] = useState<
    { time: string; theater: string }[]
  >([]);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);
  const [selectedTheater, setSelectedTheater] =
    useState<string>(initialTheater);

  // Tạo dữ liệu ghế giả lập
  useEffect(() => {
    const generateSeats = () => {
      const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const seatsPerRow = 10;
      const generatedSeats: Seat[] = [];

      rows.forEach((row) => {
        for (let i = 1; i <= seatsPerRow; i++) {
          // Tạo trạng thái ngẫu nhiên cho một số ghế (để mô phỏng ghế đã đặt)
          const randomStatus = Math.random() < 0.2 ? "reserved" : "available";
          // Giá vé khác nhau tùy theo hàng ghế
          const price = row <= "C" ? 120000 : 90000;

          generatedSeats.push({
            id: `${row}${i}`,
            row,
            number: i,
            status: randomStatus,
            price,
          });
        }
      });

      setSeats(generatedSeats);
    };

    generateSeats();
  }, [selectedTime, selectedTheater]); // Tạo lại ghế khi thay đổi giờ hoặc rạp

  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) return;

      try {
        setLoading(true);
        const [movieData, showtimesData] = await Promise.all([
          getMovieDetails(Number(movieId)),
          getShowtimes(),
        ]);

        setMovie(movieData);

        // Lọc các suất chiếu trong ngày đã chọn
        if (date) {
          const timesOnSelectedDate = showtimesData.filter((st: Showtime) => {
            const showtimeDate = new Date(st.startTime)
              .toISOString()
              .split("T")[0];
            return showtimeDate === date;
          });

          // Tạo danh sách giờ chiếu có sẵn
          const availableTimeSlots = timesOnSelectedDate.map((st: Showtime) => {
            const timeStr = new Date(st.startTime)
              .toTimeString()
              .split(" ")[0]
              .substring(0, 5);
            return {
              time: timeStr,
              theater: `Rạp ${st.cinemaId}`,
            };
          });

          setAvailableTimes(availableTimeSlots);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin:", error);
        message.error("Không thể lấy thông tin phim và lịch chiếu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, date]);

  useEffect(() => {
    // Tính tổng tiền khi danh sách ghế được chọn thay đổi
    const total = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    setTotalPrice(total);
  }, [selectedSeats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "reserved") return;

    const updatedSeats = seats.map((s) => {
      if (s.id === seat.id) {
        const newStatus = s.status === "available" ? "selected" : "available";
        return {
          ...s,
          status: newStatus as "available" | "reserved" | "selected",
        };
      }
      return s;
    });

    setSeats(updatedSeats);

    // Cập nhật danh sách ghế đã chọn
    if (seat.status === "available") {
      setSelectedSeats([...selectedSeats, seat]);
    } else {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    }
  };

  const handleTimeChange = (timeInfo: { time: string; theater: string }) => {
    setSelectedTime(timeInfo.time);
    setSelectedTheater(timeInfo.theater);
    // Reset ghế đã chọn khi đổi giờ chiếu
    setSelectedSeats([]);
  };

  const handleBooking = () => {
    if (selectedSeats.length === 0) {
      message.warning("Vui lòng chọn ít nhất một ghế");
      return;
    }

    // Ở đây sẽ gửi thông tin đặt vé lên server
    // Giả lập thành công
    message.success("Đặt vé thành công!");
    navigate("/");
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
        <Title level={2} className="text-center text-white mb-8">
          ĐẶT VÉ XEM PHIM
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={16}>
            <Card className="mb-6">
              <div className="mb-4">
                <Title level={4}>Thông tin phim</Title>
                <div className="flex flex-col md:flex-row gap-4">
                  {movie?.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-32 h-48 object-cover rounded"
                    />
                  )}
                  <div>
                    <Title level={5}>{movie?.title}</Title>
                    <Text>Thời lượng: {movie?.duration} phút</Text>
                    <div className="mt-2">
                      <Text strong>Rạp: </Text>
                      <Text>{selectedTheater}</Text>
                    </div>
                    <div>
                      <Text strong>Ngày chiếu: </Text>
                      <Text>{new Date(date).toLocaleDateString("vi-VN")}</Text>
                    </div>
                    <div>
                      <Text strong>Giờ chiếu: </Text>
                      <Text>{selectedTime}</Text>
                    </div>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Chọn suất chiếu */}
              <div className="mb-6">
                <Title level={4}>Chọn suất chiếu</Title>
                <div className="bg-gray-100 p-4 rounded-md">
                  <div className="mb-2">
                    <Text strong>Ngày chiếu: </Text>
                    <Text>
                      {new Date(date).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </div>

                  <div>
                    <Text strong className="mb-2 block">
                      Chọn giờ chiếu:
                    </Text>
                    <Radio.Group
                      value={`${selectedTime}-${selectedTheater}`}
                      onChange={(e) => {
                        const [time, theater] = e.target.value.split("-");
                        handleTimeChange({ time, theater });
                      }}
                    >
                      <Space direction="vertical" className="w-full">
                        {availableTimes.map((timeSlot, index) => (
                          <Radio.Button
                            key={index}
                            value={`${timeSlot.time}-${timeSlot.theater}`}
                            className="w-full text-center mb-2 flex items-center"
                          >
                            <ClockCircleOutlined className="mr-2" />
                            <span className="font-bold">{timeSlot.time}</span>
                            <span className="ml-2 text-gray-600">
                              ({timeSlot.theater})
                            </span>
                          </Radio.Button>
                        ))}
                      </Space>
                    </Radio.Group>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="mb-6">
                <Title level={4}>Chọn ghế</Title>
                <div className="flex justify-center mb-4">
                  <div className="w-full max-w-3xl bg-gray-800 p-4 rounded-lg">
                    <div className="w-full h-8 bg-gray-700 text-center mb-8 rounded">
                      MÀN HÌNH
                    </div>

                    <div className="grid grid-cols-10 gap-2">
                      {seats.map((seat) => (
                        <button
                          key={seat.id}
                          className={`w-full aspect-square rounded-md text-xs font-bold flex items-center justify-center ${
                            seat.status === "available"
                              ? "bg-gray-500 hover:bg-blue-500"
                              : seat.status === "selected"
                              ? "bg-green-500"
                              : "bg-red-500 cursor-not-allowed"
                          }`}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === "reserved"}
                        >
                          {seat.row}
                          {seat.number}
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-center gap-8 mt-6">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Ghế trống</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Ghế đã chọn</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-sm mr-2"></div>
                        <span className="text-sm">Ghế đã đặt</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="sticky top-4">
              <Title level={4}>Thông tin đặt vé</Title>
              <div className="mb-4">
                <Text strong>Phim: </Text>
                <Text>{movie?.title}</Text>
              </div>
              <div className="mb-4">
                <Text strong>Suất chiếu: </Text>
                <Text>
                  {selectedTime} - {new Date(date).toLocaleDateString("vi-VN")}
                </Text>
              </div>
              <div className="mb-4">
                <Text strong>Rạp: </Text>
                <Text>{selectedTheater}</Text>
              </div>

              <Divider />

              <div className="mb-4">
                <Text strong>Ghế đã chọn: </Text>
                <Text>
                  {selectedSeats.length > 0
                    ? selectedSeats.map((seat) => seat.id).join(", ")
                    : "Chưa chọn ghế"}
                </Text>
              </div>

              <div className="mb-6">
                <Text strong>Tổng tiền: </Text>
                <Text className="text-xl font-bold text-red-500">
                  {totalPrice.toLocaleString("vi-VN")} VNĐ
                </Text>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleBooking}
                disabled={selectedSeats.length === 0}
                className="bg-yellow-500 hover:bg-yellow-600"
              >
                Đặt vé
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
