import api from "./api";

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration?: number;
  genre: string;
  rating?: number;
  director?: string;
  cast?: string[];
  status?: string;
  language?: string;
  trailer?: string;
  poster?: string;
  releaseDate: string;
}

export interface MovieDetails extends Movie {
  showtimes?: Showtime[];
  reviews?: Review[];
}

export interface Showtime {
  id: number;
  movieId: number;
  startTime: string;
  endTime: string;
  roomId: number;
  price: number;
  cinemaId: number;
  availableSeats: number;
  totalSeats: number;
}

export interface Review {
  id: number;
  movieId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export const getMovies = async (): Promise<Movie[]> => {
  try {
    const response = await api.get("/movie");
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  try {
    const response = await api.get(`/movie/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${id}:`, error);
    throw error;
  }
};

export const updateMovie = async (
  id: number,
  data: Partial<Movie>
): Promise<Movie> => {
  try {
    const response = await api.put(`/movie/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating movie with ID ${id}:`, error);
    throw error;
  }
};

export const deleteMovie = async (id: number): Promise<void> => {
  try {
    await api.delete(`/movie/${id}`);
  } catch (error) {
    console.error(`Error deleting movie with ID ${id}:`, error);
    throw error;
  }
};

export const getShowtimes = async (movieId?: number): Promise<Showtime[]> => {
  try {
    const url = movieId ? `/showtimes?movieId=${movieId}` : "/showtimes";
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    throw error;
  }
};

export const createReview = async (
  movieId: number,
  data: { rating: number; comment: string }
): Promise<Review> => {
  try {
    const response = await api.post(`/movie/${movieId}/reviews`, data);
    return response.data;
  } catch (error) {
    console.error(`Error creating review for movie ${movieId}:`, error);
    throw error;
  }
};
