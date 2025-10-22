import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // ===============================
  // 🔑 LOGIN FUNCTION
  // ===============================
  const login = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      if (res.data.success && res.data.token) {
        const loggedUser = { ...res.data.user, token: res.data.token };
        setUser(loggedUser);
        localStorage.setItem("user", JSON.stringify(loggedUser));
        return { success: true, message: "Login successful" };
      }

      return { success: false, message: res.data.message || "Login failed" };
    } catch (err) {
      console.error("Login error:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Server error",
      };
    }
  };

  // ===============================
  // 🧾 REGISTER FUNCTION
  // ===============================
  const register = async (username, password) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
      });

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message || "Registered successfully",
        };
      }

      return { success: false, message: res.data.message || "Registration failed" };
    } catch (err) {
      console.error("Registration error:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Server error",
      };
    }
  };

  // ===============================
  // 🚪 LOGOUT FUNCTION
  // ===============================
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // ===============================
  // ⚙️ AXIOS INSTANCE WITH INTERCEPTORS
  // ===============================
  const authAxios = axios.create({
    baseURL: "http://localhost:5000",
  });

  // Attach Authorization header before every request
  authAxios.interceptors.request.use((config) => {
    const savedUser = localStorage.getItem("user");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    if (currentUser?.token) {
      config.headers.Authorization = `Bearer ${currentUser.token}`;
    }
    return config;
  });

  // Auto-logout if token is invalid or expired
  authAxios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.response && err.response.status === 401) {
        console.warn("🔒 Token invalid or expired — logging out...");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
      }
      return Promise.reject(err);
    }
  );

  // ===============================
  // 🧠 AUTO-REFRESH STATE
  // ===============================
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, authAxios }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
