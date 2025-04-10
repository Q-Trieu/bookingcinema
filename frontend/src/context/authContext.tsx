import React, { useState } from "react";
import { AuthContext, User } from "./AuthContext";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const isUser = () => {
    return user?.role === "user";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
