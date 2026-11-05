import { createContext, useContext, useState } from "react";
import apiService from "../services/ApiService.js";

export const HOME_PATHS = {
  admin: "/admin",
  doctor: "/doctor",
  patient: "/patient",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")));
  const [welcome, setWelcome] = useState(false); // shows the "login successful" popup

  const saveSession = ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const login = async (email, password) => {
    const savedUser = saveSession(await apiService.login(email, password));
    setWelcome(true);
    return savedUser;
  };

  const register = async (form) => {
    return apiService.register(form);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setWelcome(false);
    setUser(null);
  };

  const dismissWelcome = () => setWelcome(false);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, welcome, dismissWelcome }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);