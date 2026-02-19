import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  const handleLinkClick = () => setMenuOpen(false);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      setMenuOpen(false);
      navigate('/login');
    }
  };

  return (
    <nav className={`navbar ${darkMode ? 'navbar-dark' : ''}`}>
      <Link to="/" className="logo" onClick={handleLinkClick}>
        DigiBlock
      </Link>

      <button
        className="menu-btn"
        onClick={() => setMenuOpen(prev => !prev)}
      >
        ☰
      </button>

      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>

        {user && (
          <li>
            <Link to="/dashboard" onClick={handleLinkClick}>
              Dashboard
            </Link>
          </li>
        )}

        {/* ✅ FIXED LINK */}
        <li>
          <Link to="/form" onClick={handleLinkClick}>
            Smart Form
          </Link>
        </li>

        {user?.role === "admin" && (
          <li>
            <Link to="/admin/forms" onClick={handleLinkClick}>
              Create Form
            </Link>
          </li>
        )}

        <li>
          <Link to="/retrieve-document" onClick={handleLinkClick}>
            Retrieve Document
          </Link>
        </li>

        {!user && (
          <>
            <li>
              <Link to="/login" onClick={handleLinkClick}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" onClick={handleLinkClick}>
                Register
              </Link>
            </li>
          </>
        )}

        {user && (
          <li>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
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
