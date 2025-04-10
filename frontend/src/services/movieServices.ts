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
export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  try {
    const response = await axiosInstance.get(`/movies/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    throw new Error("Failed to fetch movie details");
  }
};
