import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Make sure you have this CSS file
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [menuOpen, setMenuOpen] = useState(false); // State for hamburger menu
  const navigate = useNavigate();
  const { user, logout } = useAuth();  // ✅ use correct function

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  // Close menu when a link is clicked
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
  const confirmLogout = window.confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    logout();   // ✅ call logoutUser
    setMenuOpen(false);
    navigate('/login');
  }
};

  return (
    <nav className={`navbar ${darkMode ? 'navbar-dark' : ''}`}>
      <Link to="/" className="logo" onClick={handleLinkClick}>MyDigiLocker</Link>

      {/* Hamburger Menu Icon
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✖️' : '☰'}
      </div> */}

      {/* Add 'active' class when menu is open */}
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        {user && <li><Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link></li>}
        
         <li><Link to="/retrieve-document" onClick={handleLinkClick}>Retrieve Document</Link></li>

        {!user && <li><Link to="/login" onClick={handleLinkClick}>Login</Link></li>}
        {!user && <li><Link to="/register" onClick={handleLinkClick}>Register</Link></li>}
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