import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select, Typography, Modal, message } from "antd";
import { getMovies, Movie } from "../../services/movieServices";
import { getAllSeats, Seat } from "../../services/seatService";
import { createBooking } from "../../services/bookingServices";
import Header from "../../components/header";
import Footer from "../../components/footer";

const { Title, Text } = Typography;
const { Option } = Select;

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<number | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<number | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Dữ liệu mẫu cho giờ chiếu
  const showtimes = ["09:00", "11:30", "14:00", "16:30", "19:00", "21:30"];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesData = await getMovies();
        setMovies(moviesData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phim:", error);
        message.error("Không thể lấy danh sách phim");
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchSeats = async () => {
      if (selectedMovie && selectedCinema && selectedShowtime) {
        try {
          const seatsData = await getAllSeats(selectedMovie.toString());
          setSeats(seatsData);
        } catch (error) {
          console.error("Lỗi khi lấy danh sách ghế:", error);
          message.error("Không thể lấy danh sách ghế");
        }
      }
    };

    fetchSeats();
  }, [selectedMovie, selectedCinema, selectedShowtime]);

  const handleSeatSelect = (seatNumber: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((seat) => seat !== seatNumber);
      }
      return [...prev, seatNumber];
    });
  };

  useEffect(() => {
    const calculateTotalPrice = () => {
      const total = selectedSeats.reduce((sum, seatNumber) => {
        const seat = seats.find((s) => s.seatNumber === seatNumber);
        return sum + (seat?.price || 0);
      }, 0);
      setTotalPrice(total);
    };

    calculateTotalPrice();
  }, [selectedSeats, seats]);

  const handleBooking = async () => {
    if (
      !selectedMovie ||
      !selectedCinema ||
      !selectedShowtime ||
      selectedSeats.length === 0
    ) {
      message.error("Vui lòng chọn đầy đủ thông tin");
      return;
    }

    try {
      const bookingData = {
        movieId: selectedMovie,
        cinemaId: selectedCinema,
        showtimeId: 1,
        selectedSeats: selectedSeats.map(Number),
        userId: 1, // Lấy từ context auth
        totalPrice: totalPrice,
        bookingDate: new Date().toISOString(),
      };

      await createBooking(bookingData);
      setIsModalVisible(true);
    } catch (error) {
      console.error("Lỗi khi đặt vé:", error);
      message.error("Không thể đặt vé");
    }
  };

  const handlePayment = () => {
    navigate("/payment", {
      state: {
        movieId: selectedMovie,
        cinemaId: selectedCinema,
        showtime: selectedShowtime,
        seats: selectedSeats,
        totalPrice: totalPrice,
      },
    });
  };

  return (
    <div className="bg-[#800000] text-white min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Title level={2} className="text-white">
          Đặt Vé Xem Phim
        </Title>

        <div className="space-y-6">
          <div>
            <Text className="text-white">Chọn Phim:</Text>
            <Select
              className="w-full"
              onChange={(value) => setSelectedMovie(Number(value))}
              placeholder="Chọn phim"
            >
              {movies.map((movie) => (
                <Option key={movie.id} value={movie.id}>
                  {movie.title}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text className="text-white">Chọn Rạp:</Text>
            <Select
              className="w-full"
              onChange={(value) => setSelectedCinema(Number(value))}
              placeholder="Chọn rạp"
            >
              <Option value={1}>Rạp 1</Option>
              <Option value={2}>Rạp 2</Option>
              <Option value={3}>Rạp 3</Option>
            </Select>
          </div>

          <div>
            <Text className="text-white">Chọn Giờ Chiếu:</Text>
            <Select
              className="w-full"
              onChange={(value) => setSelectedShowtime(value)}
              placeholder="Chọn giờ chiếu"
            >
              {showtimes.map((time) => (
                <Option key={time} value={time}>
                  {time}
                </Option>
              ))}
            </Select>
          </div>

          <div>
            <Text className="text-white">Chọn Ghế:</Text>
            <div className="grid grid-cols-8 gap-2">
              {seats.map((seat) => (
                <Button
                  key={seat.seatNumber}
                  type={
                    selectedSeats.includes(seat.seatNumber)
                      ? "primary"
                      : "default"
                  }
                  onClick={() => handleSeatSelect(seat.seatNumber)}
                  disabled={seat.status === "booked"}
                  className="flex items-center justify-center"
                >
                  <div>
                    <div>{seat.seatNumber}</div>
                    <div className="text-xs">{seat.type}</div>
                    <div className="text-xs">{seat.price}đ</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            <Text className="text-white text-lg">
              Tổng tiền: {totalPrice.toLocaleString()} VND
            </Text>
          </div>

          <Button type="primary" onClick={handleBooking} className="w-full">
            Đặt Vé
          </Button>
        </div>

        <Modal
          title="Xác nhận đặt vé"
          visible={isModalVisible}
          onOk={handlePayment}
          onCancel={() => setIsModalVisible(false)}
          okText="Thanh toán"
          cancelText="Đóng"
        >
          <div className="space-y-2">
            <p>Thông tin vé của bạn:</p>
            <p>Phim: {movies.find((m) => m.id === selectedMovie)?.title}</p>
            <p>Rạp: Rạp {selectedCinema}</p>
            <p>Suất chiếu: {selectedShowtime}</p>
            <p>Ghế: {selectedSeats.join(", ")}</p>
            <p className="font-bold">
              Tổng tiền: {totalPrice.toLocaleString()} VND
            </p>
          </div>
        </Modal>
      </div>
      <Footer />
    </div>
  );
};

export default BookingPage;
