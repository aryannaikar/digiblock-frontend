import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await login(form.username, form.password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className='login-body'>
      <div className="login-container">
        <h1>Login</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className='login-form'>
          <p className='par'>Enter Your Username:</p>
          <input
            type="text"
            placeholder="Username"
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />

          <p className='par'>Enter Your Password:</p>
          <input
            type="password"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
