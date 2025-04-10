import { Route, Routes } from "react-router-dom";
import Home from "./pages/public/home";
import { useAuth } from "./hook/useAuth";
import { Navigate } from "react-router-dom";
import LoginForm from "./pages/user/login";
import RegisterForm from "./pages/user/register";

function App() {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/movies/:id"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/movies"
        element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginForm /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <RegisterForm /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;
