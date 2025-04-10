import { createBrowserRouter } from "react-router-dom";

// Public pages
import Home from "../pages/public/home";
import MoviePage from "../pages/public/movie";
import MovieDetailPage from "../pages/public/movieDetail";
import BookingPage from "../pages/public/booking";

// User pages
import PaymentPage from "../pages/user/payment";
import LoginForm from "../pages/user/login";
import RegisterForm from "../pages/user/register";
import OTPPage from "../pages/user/otp";

// Admin pages
import Dashboard from "../pages/admin/dashboard";
import NotFound from "../pages/public/notfound";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/movies",
    element: <MoviePage />,
  },
  {
    path: "/movies/:id",
    element: <MovieDetailPage />,
  },
  {
    path: "/booking/:movieId",
    element: <BookingPage />,
  },
  {
    path: "/payment",
    element: <PaymentPage />,
  },
  {
    path: "/login",
    element: <LoginForm />,
  },
  {
    path: "/register",
    element: <RegisterForm />,
  },
  {
    path: "/verify-otp",
    element: <OTPPage />,
  },
  // Admin routes
  {
    path: "/admin",
    element: <Dashboard />,
  },
  {
    path: "/admin/movies",
    element: <div>Quản lý phim (cần tạo component)</div>,
  },
  {
    path: "/admin/showtimes",
    element: <div>Quản lý lịch chiếu (cần tạo component)</div>,
  },
  {
    path: "/admin/users",
    element: <div>Quản lý người dùng (cần tạo component)</div>,
  },
  {
    path: "/admin/bookings",
    element: <div>Quản lý đặt vé (cần tạo component)</div>,
  },
  // Fallback route
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
