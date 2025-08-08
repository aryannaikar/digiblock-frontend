import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className={`navbar ${darkMode ? 'navbar-dark' : ''}`}>
      
      <Link to="/" className="logo">MyDigiLocker</Link>

      <ul className="nav-links">
        {user && <li><Link to="/dashboard">Dashboard</Link></li>}

        {!user && <li><Link to="/login">Login</Link></li>}
        {!user && <li><Link to="/register">Register</Link></li>}

        {user && (
          <li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </li>
        )}
        
        <li>
          <button onClick={toggleDarkMode} className="toggle-btn">
            {darkMode ? '☀️' : '🌙'}
          </button>
        </li>
      </ul>
    </nav>
  );
}
