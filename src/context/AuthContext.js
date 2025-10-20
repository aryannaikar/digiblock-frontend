import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { username, password });
      if (res.data.success) {
        const loggedUser = { ...res.data.user, token: res.data.token };
        setUser(loggedUser);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        return { success: true };
      } else return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const register = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", { username, password });
      if (res.data?.success) {
        return { success: true, message: res.data.message || "Registered successfully" };
      }
      return { success: false, message: res.data?.message || "Registration failed" };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const authAxios = axios.create({ baseURL: "http://localhost:5000" });
  authAxios.interceptors.request.use(config => {
    // Get fresh token from localStorage on each request
    const savedUser = localStorage.getItem("user");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    if (currentUser?.token) {
      config.headers.Authorization = `Bearer ${currentUser.token}`;
    }
    return config;
  });

  return (
    <AuthContext.Provider value={{ user, login, register, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
