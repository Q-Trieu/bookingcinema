import { createContext } from "react";

export interface User {
  id: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAdmin: () => boolean;
  isUser: () => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
