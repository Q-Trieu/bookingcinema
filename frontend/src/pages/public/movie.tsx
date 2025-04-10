import React, { useState, useEffect } from "react";
import { useAuth } from "../../hook/useAuth";
import { getMovies, Movie } from "../../services/movieServices";
import { Button, Typography } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";

const MoviePage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviesData = await getMovies();
        // Lọc các phim có suất chiếu
        const showingMovies = moviesData.filter(
          (movie) => movie.status === "showing"
        );
        setMovies(showingMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) {
    return <Typography.Text>Loading...</Typography.Text>;
  }

  return (
    <div className="bg-[#800000] text-white min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {movies.map((movie) => (
          <div key={movie.id}>
            <Typography.Title>
              <a href={`/movies/${movie.id}`}>{movie.title}</a>
            </Typography.Title>
            <Typography.Paragraph>{movie.description}</Typography.Paragraph>
            {isAdmin() && (
              <div className="flex space-x-4">
                <Button>Cập Nhật</Button>
                <Button danger>Xóa</Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default MoviePage;
