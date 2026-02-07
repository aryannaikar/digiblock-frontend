import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar/Navbar";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import OtpLogin from "./pages/OtpLogin/OtpLogin";
import Home from "./pages/Home/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import DocumentSorter from "./pages/Dashboard/DocumentSorter";
import ApiTest from "./pages/ApiTest/ApiTest";
import RetrieveDocument from "./pages/RetrieveDocument/RetrieveDocument";
import SmartForm from "./pages/SmartForm/SmartForm";

import "./App.css";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        {/* NO container wrapper here */}
        <Routes>

          {/* ---------- PUBLIC ROUTES ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/OtpLogin" element={<OtpLogin />} />
          <Route path="/smart-form" element={<SmartForm />} />
          <Route path="/retrieve-document" element={<RetrieveDocument />} />
          <Route path="/apitest" element={<ApiTest />} />

          {/* ---------- PRIVATE ROUTES ---------- */}
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

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}
