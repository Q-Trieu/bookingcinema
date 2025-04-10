import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header>
      {/* Phần trên của header với logo, nút đăng nhập/đăng ký và tiêu đề "MY CINEMA" */}
      <div className="min-w-full bg-[#800000] text-white flex items-center justify-between px-4 py-3">
        {/* Bên trái: logo */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/path-to-logo.png" alt="Logo" className="w-8 h-8" />
          </Link>
        </div>

        {/* Ở giữa: tiêu đề trung tâm */}
        <div>
          <Link to="/">
            <h1 className="text-2xl font-bold text-yellow-300">MY CINEMA</h1>
          </Link>
        </div>

        {/* Phần bên phải: Nút đăng nhập / đăng ký hoặc thông tin người dùng */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-yellow-200">
                Xin chào, {user.email} {isAdmin() && "(Admin)"}
              </span>
              {isAdmin() && (
                <Link
                  to="/admin"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
                >
                  Quản trị
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-1.5 bg-green-600 hover:bg-green-700 rounded text-white font-medium transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Thanh menu điều hướng */}
      <nav className="bg-[#800000] border-t border-white">
        <ul className="flex justify-center space-x-8 py-2">
          <li className="cursor-pointer hover:text-yellow-300">
            <Link to="/movies">PHIM</Link>
          </li>
          <li className="cursor-pointer hover:text-yellow-300">
            <Link to="/booking/1">MUA VÉ</Link>
          </li>
          <li className="cursor-pointer hover:text-yellow-300">
            <Link to="/promotions">GIẢM GIÁ</Link>
          </li>
          <li className="cursor-pointer hover:text-yellow-300">
            <Link to="/contact">LIÊN HỆ</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
