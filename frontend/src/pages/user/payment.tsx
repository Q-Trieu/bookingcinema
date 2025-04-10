import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Select, Typography, message } from "antd";
import { createPayment, Payment } from "../../services/paymentServices";
import Header from "../../components/header";
import Footer from "../../components/footer";

const { Title, Text } = Typography;
const { Option } = Select;

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");

  const { movieId, cinemaId, showtime, seats, totalPrice, bookingId } =
    location.state || {};

  const handlePayment = async () => {
    if (!paymentMethod) {
      message.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    const paymentData: Payment = {
      id: 0, // ID sẽ được tạo tự động
      bookingId: bookingId, // Sử dụng bookingId từ trạng thái
      amount: totalPrice,
      paymentMethod: paymentMethod,
      status: "pending",
    };

    try {
      const paymentResponse = await createPayment(paymentData);
      message.success("Thanh toán thành công");
      navigate("/confirmation", { state: { paymentResponse } });
    } catch (error) {
      console.error("Error creating payment:", error);
      message.error("Không thể thực hiện thanh toán");
    }
  };

  return (
    <div className="bg-[#800000] text-white min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Title level={2} className="text-white">
          Thanh Toán
        </Title>
        <div className="space-y-6">
          <div>
            <Text className="text-white">Chọn Phương Thức Thanh Toán:</Text>
            <Select
              className="w-full"
              onChange={(value) => setPaymentMethod(value)}
              placeholder="Chọn phương thức thanh toán"
              defaultValue="credit_card"
            >
              <Option value="credit_card">Thẻ tín dụng</Option>
              <Option value="paypal">PayPal</Option>
              <Option value="bank_transfer">Chuyển khoản ngân hàng</Option>
            </Select>
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            <Text className="text-white text-lg">
              Tổng tiền: {totalPrice?.toLocaleString()} VND
            </Text>
            <Text className="text-white">Phim: {movieId}</Text>
            <Text className="text-white">Rạp: {cinemaId}</Text>
            <Text className="text-white">Suất chiếu: {showtime}</Text>
            <Text className="text-white">Ghế: {seats?.join(", ")}</Text>
          </div>

          <Button type="primary" onClick={handlePayment} className="w-full">
            Thanh Toán
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
