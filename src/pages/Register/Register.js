import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const res = await register(form.username, form.password);
    if (res.success) {
      alert(res.message);
      navigate('/login');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className='register-body'>
      <div className="register-container">
        <h1>Register</h1>
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className='register-form'>
          <p className='para'>Create Your Username:</p>
          <input
            type="text"
            placeholder="Username"
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
          />

          <p className='para'>Create Your Password:</p>
          <input
            type="password"
            placeholder="Password"
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}
