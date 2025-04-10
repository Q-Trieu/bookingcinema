import React, { useState, useEffect } from "react";
import { getMovies, Movie } from "../../services/movieServices";
import { List, Typography } from "antd";
import Header from "../../components/header";
import Footer from "../../components/footer";

const Home: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    
    useEffect(() => {
        const fetchMovies = async () => {
        try {
            const moviesData = await getMovies();
            setMovies(moviesData);
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
        <Header/>
        <List
        itemLayout="horizontal"
        dataSource={movies}
        renderItem={(movie) => (
            <List.Item>
            <List.Item.Meta
                title={<a href={`/movies/${movie.id}`}>{movie.title}</a>}
                description={movie.description}
            />
            </List.Item>
        )}
        />
        <Footer/>
        </div>
    );
    }
export default Home;