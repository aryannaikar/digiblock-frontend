import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard/Dashboard';
import './App.css';
import OtpLogin from './pages/OtpLogin/OtpLogin';
import DocumentSorter from './pages/Dashboard/DocumentSorter';
import ApiTest from './pages/ApiTest/ApiTest'; // ✅ Added import


function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className='container'>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/OtpLogin" element={<OtpLogin />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<Register />} />
            <Route path="/apitest" element={<ApiTest />} /> {/* ✅ Added route */}
            <Route path="/dashboard/sorter" element={
              <PrivateRoute>
                <DocumentSorter />
              </PrivateRoute>
            } />
            <Route path="/" element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}
