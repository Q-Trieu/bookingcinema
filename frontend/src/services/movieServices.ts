import axiosInstance from "./axiosInstance";

export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseDate: string;
  genre: string;
  rating: number;
  status: string;
  posterUrl: string;
  trailerUrl: string;
}
export interface MovieDetails extends Movie {
  cast: string[];
  director: string;
  duration: number;
  writer: string;
}

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await axiosInstance.get("/movies");
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw new Error("Failed to fetch movies");
  }
};
export const createMovie = async (
  movieData: Omit<Movie, "id">
): Promise<Movie> => {
  try {
    const response = await axiosInstance.post("/movies", movieData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo phim:", error);
    throw new Error("Không thể tạo phim mới");
  }
};

export const updateMovie = async (
  id: number,
  movieData: Partial<MovieDetails>
): Promise<Movie> => {
  try {
    const response = await axiosInstance.put(`/movies/${id}`, movieData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật phim:", error);
    throw new Error("Không thể cập nhật phim");
  }
};

export const deleteMovie = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/movies/${id}`);
  } catch (error) {
    console.error("Lỗi khi xóa phim:", error);
    throw new Error("Không thể xóa phim");
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  try {
    const response = await axiosInstance.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw new Error("Failed to fetch movie details");
  }
};
