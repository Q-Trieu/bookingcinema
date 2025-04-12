import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const location = useLocation();

  // Kiểm tra xem người dùng đã đăng nhập chưa
  const isAuthenticated = localStorage.getItem("accessToken") !== null;

  // Lấy thông tin user từ localStorage
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Kiểm tra xem người dùng có phải admin không
  const isAdmin = user && user.role === "admin";

  // Nếu route yêu cầu quyền admin nhưng người dùng không phải admin
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/forbidden" state={{ from: location }} replace />;
  }

  // Nếu chưa đăng nhập, chuyển hướng về trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập và không yêu cầu quyền admin hoặc có quyền admin
  return <>{children}</>;
};

export default ProtectedRoute;
