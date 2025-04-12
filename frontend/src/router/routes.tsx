import { createBrowserRouter } from "react-router-dom";

// Public pages
import Home from "../pages/public/home";
import MoviePage from "../pages/public/movie";
import MovieDetailPage from "../pages/public/movieDetail";
import BookingPage from "../pages/public/booking";
import NotFound from "../pages/public/notfound";
import Forbidden from "../pages/public/forbidden";

// Auth pages
import LoginForm from "../pages/user/login";
import RegisterForm from "../pages/user/register";
import OTPPage from "../pages/user/otp";
import PaymentPage from "../pages/user/payment";

// Admin pages
import Dashboard from "../pages/admin/dashboard";

// Protected Route Component
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/movie",
    element: <MoviePage />,
  },
  {
    path: "/movie/:slug",
    element: <MovieDetailPage />,
  },

  // Auth routes
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
  {
    path: "/auth/verify-otp",
    element: <OTPPage />,
  },
  {
    path: "/auth/login",
    element: <LoginForm />,
  },
  {
    path: "/auth/register",
    element: <RegisterForm />,
  },

  // Protected routes
  {
    path: "/booking/:movieId",
    element: (
      <ProtectedRoute>
        <BookingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment",
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/user/payment",
    element: (
      <ProtectedRoute>
        <PaymentPage />
      </ProtectedRoute>
    ),
  },

  // Admin routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  // Error pages
  {
    path: "/forbidden",
    element: <Forbidden />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
