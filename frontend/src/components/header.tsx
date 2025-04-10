import React from "react";

const Header: React.FC = () => {
  return (
    <header>
      {/* Phần trên của header với logo, nút "Đăng Ký" (kèm icon Facebook) và tiêu đề "MY CINEMA" */}
      <div className="min-w-full bg-[#800000] text-white flex items-center justify-between px-4 py-3">
        {/* Bên trái: logo và nút đăng ký */}
        <div className="flex items-center space-x-4">
          {/* Logo: thay đổi đường dẫn hình ảnh cho phù hợp */}
          <img
            src="/path-to-logo.png"
            alt="Logo"
            className="w-5 h-5"
          />
          {/* Nút đăng ký với biểu tượng Facebook */}
          <div className="flex items-center space-x-2 cursor-pointer">
            <img
              src="/path-to-facebook-icon.png"
              alt="Facebook Icon"
              className="w-6 h-6"
            />
            <span>Đăng Ký</span>
          </div>
        </div>

        {/* Ở giữa: tiêu đề trung tâm */}
        <div>
          <h1 className="text-2xl font-bold text-yellow-300">MY CINEMA</h1>
        </div>

        {/* Phần bên phải: sử dụng div rỗng để căn chỉnh (có thể thay đổi hoặc bổ sung nếu cần) */}
        <div className="w-10" />
      </div>

      {/* Thanh menu điều hướng */}
      <nav className="bg-[#800000] border-t border-white">
        <ul className="flex justify-center space-x-8 py-2">
          <li className="cursor-pointer hover:text-yellow-300">MUA VÉ</li>
          <li className="cursor-pointer hover:text-yellow-300">PHIM</li>
          <li className="cursor-pointer hover:text-yellow-300">GIẢM GIÁ</li>
          <li className="cursor-pointer hover:text-yellow-300">LIÊN HỆ</li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
