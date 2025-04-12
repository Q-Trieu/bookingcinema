import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getMovieDetails,
  updateMovie,
  deleteMovie,
  getShowtimes,
  createReview,
  MovieDetails,
  Showtime,
} from "../../services/movieServices";
import {
  Button,
  Typography,
  Input,
  Rate,
  Modal,
  Spin,
  notification,
  Tabs,
  Tag,
  Image,
  Card,
  Row,
  Col,
  Divider,
  Select,
  Form,
} from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../hook/useAuth";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  GlobalOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

// Định nghĩa kiểu cho form cập nhật
interface UpdateMovieForm {
  title: string;
  description: string;
  rating: number;
  director: string;
  cast: string[];
  duration: number;
  genre: string;
  status: string;
  language?: string;
  trailer?: string;
  poster?: string;
}

// Định nghĩa kiểu cho form đánh giá
interface ReviewForm {
  rating: number;
  comment: string;
}

const MovieDetailPage: React.FC = () => {
  // Refs và state
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [activeDate, setActiveDate] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [updateForm] = Form.useForm<UpdateMovieForm>();
  const [reviewForm] = Form.useForm<ReviewForm>();

  // Fetch dữ liệu phim
  const fetchMovieData = useCallback(async () => {
    try {
      setLoading(true);
      if (!id) {
        setError("ID phim không hợp lệ");
        return;
      }

      const movieId = parseInt(id, 10);
      if (isNaN(movieId)) {
        setError("ID phim không hợp lệ");
        return;
      }

      const [movieData, showtimesData] = await Promise.all([
        getMovieDetails(movieId),
        getShowtimes(movieId),
      ]);

      if (movieData) {
        setMovie(movieData);
        updateForm.setFieldsValue({
          title: movieData.title,
          description: movieData.description,
          rating: movieData.rating || 0,
          director: movieData.director || "",
          cast: Array.isArray(movieData.cast) ? movieData.cast : [],
          duration: movieData.duration || 0,
          genre: movieData.genre || "",
          status: movieData.status || "",
          language: movieData.language || "",
          trailer: movieData.trailer || "",
          poster: movieData.poster || "",
        });
      }

      // Xử lý lịch chiếu
      if (showtimesData) {
        setShowtimes(showtimesData);

        // Xử lý ngày chiếu
        const showtimeDates = showtimesData
          .map((st) => {
            try {
              if (!st.startTime || isNaN(new Date(st.startTime).getTime())) {
                return null;
              }
              const date = new Date(st.startTime);
              return date.toISOString().split("T")[0];
            } catch (error) {
              console.error("Lỗi xử lý thời gian:", error);
              return null;
            }
          })
          .filter((date): date is string => date !== null);

        const uniqueDates = [...new Set(showtimeDates)].sort();
        setDates(uniqueDates);
        if (uniqueDates.length > 0) {
          setActiveDate(uniqueDates[0]);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin phim:", error);
      setError("Không thể lấy thông tin chi tiết phim. Vui lòng thử lại sau.");
      notification.error({
        message: "Lỗi",
        description:
          "Không thể lấy thông tin chi tiết phim. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  }, [id, updateForm]);

  useEffect(() => {
    if (id) {
      fetchMovieData();
    }
  }, [id, fetchMovieData]);

  // Xử lý cập nhật phim
  const handleOk = async () => {
    try {
      if (!id) return;

      const values = await updateForm.validateFields();
      setLoading(true);

      const updatedMovie = await updateMovie(parseInt(id, 10), values);
      if (updatedMovie) {
        setMovie(updatedMovie);
        notification.success({
          message: "Cập nhật thành công",
          description: "Thông tin phim đã được cập nhật.",
        });
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật phim:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật thông tin phim. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa phim
  const handleDelete = async () => {
    try {
      if (!id) return;

      await deleteMovie(parseInt(id, 10));
      notification.success({
        message: "Xóa thành công",
        description: "Phim đã được xóa khỏi hệ thống.",
      });
      navigate("/");
    } catch (error) {
      console.error("Lỗi khi xóa phim:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa phim. Vui lòng thử lại sau.",
      });
    }
  };

  // Xử lý đánh giá phim
  const handleReviewSubmit = async () => {
    try {
      if (!id) return;

      const values = await reviewForm.validateFields();
      setLoading(true);

      await createReview(parseInt(id, 10), values);
      notification.success({
        message: "Đánh giá thành công",
        description: "Cảm ơn bạn đã đánh giá phim.",
      });
      fetchMovieData(); // Làm mới dữ liệu để hiển thị đánh giá mới
    } catch (error) {
      console.error("Lỗi khi đánh giá phim:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể gửi đánh giá. Vui lòng thử lại sau.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return "Không hợp lệ";
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Không hợp lệ";
    }
  };

  const getShowtimesForDate = (date: string) => {
    return showtimes.filter((st: Showtime) => {
      try {
        const showtimeDate = new Date(st.startTime);
        return showtimeDate.toISOString().split("T")[0] === date;
      } catch {
        return false;
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#800000]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#800000] text-white min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Typography.Title level={3} className="text-white">
            {error}
          </Typography.Title>
          <Button type="primary">
            <Link to="/">Quay lại trang chủ</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#800000] text-white min-h-screen">
      <Header />
      {movie && (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link to="/movie" className="text-white hover:text-yellow-400">
              <Button
                type="primary"
                className="bg-yellow-500 hover:bg-yellow-400 mb-4"
              >
                &larr; Quay lại danh sách phim
              </Button>
            </Link>
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className="sticky top-4">
                <Image
                  src={movie.poster || "https://via.placeholder.com/300x450"}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                  fallback="https://via.placeholder.com/300x450?text=Không+có+poster"
                />

                {movie.trailer && (
                  <div className="mt-4">
                    <Button
                      type="primary"
                      block
                      size="large"
                      onClick={() => window.open(movie.trailer, "_blank")}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Xem Trailer
                    </Button>
                  </div>
                )}
              </div>
            </Col>
            <Col xs={24} md={16}>
              <Title level={2} className="text-white mb-2">
                {movie.title}
              </Title>

              <div className="flex flex-wrap gap-2 mb-6">
                <Tag color="blue">{movie.genre}</Tag>
                {movie.status === "active" && (
                  <Tag color="green">Đang chiếu</Tag>
                )}
                {movie.status === "coming" && (
                  <Tag color="orange">Sắp chiếu</Tag>
                )}
                {movie.status === "ended" && <Tag color="red">Đã kết thúc</Tag>}
                {movie.status === "deleted" && <Tag color="gray">Đã xóa</Tag>}
                <Tag color="cyan">{movie.duration} phút</Tag>
                {movie.language && <Tag color="purple">{movie.language}</Tag>}
              </div>

              <Card className="bg-gray-900 border border-gray-700 mb-6">
                <div className="flex items-center mb-2">
                  <Rate disabled value={movie.rating || 0} />
                  <Text className="ml-2 text-yellow-400 text-lg font-bold">
                    {movie.rating ? movie.rating.toFixed(1) : "0"}/5
                  </Text>
                </div>
                <div className="text-white text-sm">
                  Dựa trên đánh giá của người xem
                </div>
              </Card>

              <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6">
                <Title level={4} className="text-white mb-4">
                  Nội dung phim
                </Title>
                <Paragraph className="text-white text-base whitespace-pre-line">
                  {movie.description}
                </Paragraph>
              </div>

              <Card className="bg-gray-900 border border-gray-700 mb-6">
                <Title level={4} className="text-white mb-4">
                  Thông tin chi tiết
                </Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <div className="flex items-center mb-3">
                      <CalendarOutlined className="mr-2 text-yellow-500" />
                      <div>
                        <Text className="text-gray-400 block">Ngày ra mắt</Text>
                        <Text className="text-white">
                          {movie.releaseDate
                            ? new Date(movie.releaseDate).toLocaleDateString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "Chưa cập nhật"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center mb-3">
                      <ClockCircleOutlined className="mr-2 text-yellow-500" />
                      <div>
                        <Text className="text-gray-400 block">Thời lượng</Text>
                        <Text className="text-white">
                          {movie.duration} phút
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center mb-3">
                      <VideoCameraOutlined className="mr-2 text-yellow-500" />
                      <div>
                        <Text className="text-gray-400 block">Đạo diễn</Text>
                        <Text className="text-white">
                          {movie.director || "Chưa cập nhật"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div className="flex items-center mb-3">
                      <GlobalOutlined className="mr-2 text-yellow-500" />
                      <div>
                        <Text className="text-gray-400 block">Ngôn ngữ</Text>
                        <Text className="text-white">
                          {movie.language || "Chưa cập nhật"}
                        </Text>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Divider className="bg-gray-700 my-4" />

                <div className="mb-3">
                  <Text className="text-gray-400 block mb-2">Diễn viên</Text>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(movie.cast) && movie.cast.length > 0 ? (
                      movie.cast.map((actor, index) => (
                        <Tag key={index} className="mb-2">
                          {actor}
                        </Tag>
                      ))
                    ) : (
                      <Text className="text-white">Chưa cập nhật</Text>
                    )}
                  </div>
                </div>

                <Divider className="bg-gray-700 my-4" />

                <div>
                  <Text className="text-gray-400 block mb-2">Thể loại</Text>
                  <div className="flex flex-wrap gap-2">
                    {movie.genre?.split(",").map((genre, index) => (
                      <Tag key={index} color="blue" className="mb-2">
                        {genre.trim()}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>

              {isAdmin() && (
                <div className="flex space-x-4 mb-6">
                  <Button
                    type="primary"
                    onClick={() => setIsModalVisible(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    Cập nhật phim
                  </Button>
                  <Button danger onClick={handleDelete}>
                    Xóa phim
                  </Button>
                </div>
              )}
            </Col>
          </Row>

          <Divider className="bg-gray-600 my-8" />

          <Tabs defaultActiveKey="showtimes" className="text-white custom-tabs">
            <TabPane
              tab={<span className="text-lg">Lịch Chiếu</span>}
              key="showtimes"
            >
              {dates.length > 0 ? (
                <>
                  <div className="flex overflow-x-auto pb-4 mb-4">
                    {dates.map((date) => {
                      const formattedDate = new Date(date).toLocaleDateString(
                        "vi-VN",
                        {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        }
                      );
                      return (
                        <Button
                          key={date}
                          type={activeDate === date ? "primary" : "default"}
                          onClick={() => setActiveDate(date)}
                          className="mr-2 min-w-[120px]"
                        >
                          {formattedDate}
                        </Button>
                      );
                    })}
                  </div>

                  <Row gutter={[16, 16]}>
                    {getShowtimesForDate(activeDate).length > 0 ? (
                      getShowtimesForDate(activeDate).map((showtime) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={showtime.id}>
                          <Card hoverable className="bg-gray-800 text-white">
                            <div className="text-center mb-2">
                              <Text strong className="text-white">
                                Rạp {showtime.cinemaId}
                              </Text>
                            </div>
                            <div className="flex justify-between items-center">
                              <Text className="text-white">
                                {formatTime(showtime.startTime)}
                              </Text>
                              <Link to={`/booking/${movie.id}/${showtime.id}`}>
                                <Button type="primary">Đặt vé</Button>
                              </Link>
                            </div>
                            <div className="mt-2 text-xs">
                              <Text className="text-gray-400">
                                {showtime.availableSeats}/{showtime.totalSeats}{" "}
                                ghế trống
                              </Text>
                            </div>
                          </Card>
                        </Col>
                      ))
                    ) : (
                      <Col span={24}>
                        <div className="text-center py-4">
                          <Text className="text-white">
                            Không có lịch chiếu cho ngày này
                          </Text>
                        </div>
                      </Col>
                    )}
                  </Row>
                </>
              ) : (
                <div className="text-center py-4">
                  <Text className="text-white">
                    Không có lịch chiếu cho phim này
                  </Text>
                </div>
              )}
            </TabPane>

            <TabPane
              tab={<span className="text-lg">Đánh Giá & Bình Luận</span>}
              key="reviews"
            >
              <div className="mb-6">
                <Paragraph className="text-white mb-2">
                  Đánh giá của bạn:
                </Paragraph>
                <Form form={reviewForm} onFinish={handleReviewSubmit}>
                  <Form.Item
                    name="rating"
                    rules={[
                      { required: true, message: "Vui lòng chọn đánh giá" },
                    ]}
                  >
                    <Rate />
                  </Form.Item>
                  <Form.Item
                    name="comment"
                    rules={[
                      { required: true, message: "Vui lòng nhập bình luận" },
                    ]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="Nhập bình luận của bạn..."
                    />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">
                    Gửi bình luận
                  </Button>
                </Form>
              </div>

              <Divider className="bg-gray-600" />

              <div>
                <Title level={4} className="text-white">
                  Bình luận của người xem
                </Title>
                <div className="text-center py-4">
                  <Text className="text-gray-400">Chưa có bình luận nào</Text>
                </div>
              </div>
            </TabPane>

            <TabPane
              tab={<span className="text-lg">Trailer</span>}
              key="trailer"
            >
              {movie.trailer ? (
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={movie.trailer.replace("watch?v=", "embed/")}
                    title={`Trailer phim ${movie.title}`}
                    className="w-full h-96 rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text className="text-white text-lg">
                    Chưa có trailer cho phim này
                  </Text>
                </div>
              )}
            </TabPane>
          </Tabs>

          <Modal
            title="Cập Nhật Phim"
            open={isModalVisible}
            onOk={handleOk}
            onCancel={() => setIsModalVisible(false)}
            confirmLoading={loading}
          >
            <Input
              placeholder="Tiêu đề mới"
              className="mb-4"
              value={updateForm.getFieldValue("title")}
              onChange={(e) =>
                updateForm.setFieldValue("title", e.target.value)
              }
            />
            <Input.TextArea
              placeholder="Mô tả mới"
              rows={4}
              className="mb-4"
              value={updateForm.getFieldValue("description")}
              onChange={(e) =>
                updateForm.setFieldValue("description", e.target.value)
              }
            />
            <div className="mb-4">
              <Text>Đạo diễn:</Text>
              <Input
                placeholder="Đạo diễn"
                className="mb-2"
                value={updateForm.getFieldValue("director")}
                onChange={(e) =>
                  updateForm.setFieldValue("director", e.target.value)
                }
              />
            </div>
            <div className="mb-4">
              <Text>Thể loại:</Text>
              <Input
                placeholder="Thể loại"
                className="mb-2"
                value={updateForm.getFieldValue("genre")}
                onChange={(e) =>
                  updateForm.setFieldValue("genre", e.target.value)
                }
              />
            </div>
            <div className="mb-4">
              <Text>Ngôn ngữ:</Text>
              <Input
                placeholder="Ngôn ngữ"
                className="mb-2"
                value={updateForm.getFieldValue("language")}
                onChange={(e) =>
                  updateForm.setFieldValue("language", e.target.value)
                }
              />
            </div>
            <div className="mb-4">
              <Text>Trailer URL:</Text>
              <Input
                placeholder="URL của trailer"
                className="mb-2"
                value={updateForm.getFieldValue("trailer")}
                onChange={(e) =>
                  updateForm.setFieldValue("trailer", e.target.value)
                }
              />
            </div>
            <div className="mb-4">
              <Text>Poster URL:</Text>
              <Input
                placeholder="URL của poster"
                className="mb-2"
                value={updateForm.getFieldValue("poster")}
                onChange={(e) =>
                  updateForm.setFieldValue("poster", e.target.value)
                }
              />
            </div>
            <div className="mb-4">
              <Text>Thời lượng (phút):</Text>
              <Input
                type="number"
                className="mb-2"
                value={updateForm.getFieldValue("duration")}
                onChange={(e) =>
                  updateForm.setFieldValue(
                    "duration",
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </div>
            <div className="mb-4">
              <Text>Trạng thái:</Text>
              <Select
                style={{ width: "100%" }}
                value={updateForm.getFieldValue("status")}
                onChange={(value) => updateForm.setFieldValue("status", value)}
                className="mb-2"
              >
                <Option value="active">Đang chiếu</Option>
                <Option value="coming">Sắp chiếu</Option>
                <Option value="ended">Đã kết thúc</Option>
              </Select>
            </div>
          </Modal>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MovieDetailPage;
