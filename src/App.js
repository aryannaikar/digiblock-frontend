import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar/Navbar";

// Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import OtpLogin from "./pages/OtpLogin/OtpLogin";
import Dashboard from "./pages/Dashboard/Dashboard";
import DocumentSorter from "./pages/Dashboard/DocumentSorter";
import RetrieveDocument from "./pages/RetrieveDocument/RetrieveDocument";
import ApiTest from "./pages/ApiTest/ApiTest";
import SmartForm from "./pages/SmartForm/SmartForm";

import "./App.css";

/* ===============================
   PRIVATE ROUTE
================================ */
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

/* ===============================
   ADMIN ROUTE (kept for future use)
================================ */
function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/OtpLogin" element={<OtpLogin />} />

        {/* ✅ NORMAL SMART FORM (NO TOKEN) */}
        <Route path="/form" element={<SmartForm />} />

        <Route path="/retrieve-document" element={<RetrieveDocument />} />
        <Route path="/apitest" element={<ApiTest />} />

        {/* ================= PRIVATE ROUTES ================= */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/sorter"
          element={
            <PrivateRoute>
              <DocumentSorter />
            </PrivateRoute>
          }
        />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}
