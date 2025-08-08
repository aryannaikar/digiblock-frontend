import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const register = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const exists = users.find(u => u.username === username);
    if (exists) return { success: false, message: 'User already exists' };

    const newUser = { username, password };
    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    return { success: true };
  };

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const matched = users.find(u => u.username === username && u.password === password);
    if (matched) {
      setUser(matched);
      localStorage.setItem('loggedInUser', JSON.stringify(matched));
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials Please try again' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loggedInUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
