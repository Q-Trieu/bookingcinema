import React from "react";
import { Link } from "react-router-dom";

const Forbidden: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#800000] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-center text-5xl font-bold mb-2 text-red-600">
            403
          </h2>
          <h3 className="text-center text-2xl font-semibold mb-4 text-gray-800">
            Quyền truy cập bị từ chối
          </h3>
          <p className="text-center text-gray-600 mb-6">
            Bạn không có quyền truy cập vào trang này.
          </p>

          <div className="flex space-x-4">
            <Link
              to="/"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Về trang chủ
            </Link>
            <Link
              to="/login"
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
