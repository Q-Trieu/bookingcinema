import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getMovieDetails,
  updateMovie,
  deleteMovie,
  MovieDetails,
} from "../../services/movieServices";
import { Button, Typography, Input, Rate, Modal } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";
import { useAuth } from "../../hook/useAuth";

const MovieDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<string>("");
  const [rating, setRating] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieData = await getMovieDetails(Number(id));
        setMovie(movieData);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleCommentSubmit = () => {
    // Logic để gửi bình luận
    console.log("Comment:", comment);
    setComment("");
  };

  const handleBooking = () => {
    // Logic để đặt vé
    console.log("Booking movie:", movie?.title);
  };

  const handleUpdate = async () => {
    if (movie) {
      try {
        const updatedMovie = await updateMovie(movie.id, {
          title: "Updated Title",
          cast: movie.cast,
          director: movie.director,
          duration: movie.duration,
          writer: movie.writer,
        });
        setMovie({
          ...movie,
          ...updatedMovie,
        });
      } catch (error) {
        console.error("Error updating movie:", error);
      }
    }
  };

  const handleDelete = async () => {
    if (movie) {
      try {
        await deleteMovie(movie.id);
        // Redirect or update UI after deletion
      } catch (error) {
        console.error("Error deleting movie:", error);
      }
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    handleUpdate();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return <Typography.Text>Loading...</Typography.Text>;
  }

  return (
    <div className="bg-[#800000] text-white min-h-screen">
      <Header />
      {movie && (
        <div className="container mx-auto px-4 py-8">
          <Typography.Title>{movie.title}</Typography.Title>
          <Typography.Paragraph>{movie.description}</Typography.Paragraph>
          <Rate onChange={setRating} value={rating} />
          <Input.TextArea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Viết bình luận của bạn..."
          />
          <Button onClick={handleCommentSubmit}>Gửi Bình Luận</Button>
          <Button onClick={handleBooking}>Đặt Vé</Button>
          {isAdmin() && (
            <div className="flex space-x-4 mt-4">
              <Button onClick={showModal}>Cập Nhật</Button>
              <Button danger onClick={handleDelete}>
                Xóa
              </Button>
            </div>
          )}
          <Modal
            title="Cập Nhật Phim"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Input placeholder="Tiêu đề mới" />
            {/* Thêm các trường khác nếu cần */}
          </Modal>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default MovieDetailPage;
