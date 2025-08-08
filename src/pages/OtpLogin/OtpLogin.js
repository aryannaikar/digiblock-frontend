// src/pages/OtpLogin/OtpLogin.js
import React, { useState } from 'react';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';


import { useNavigate } from 'react-router-dom';
import './OtpLogin.css';

export default function OtpLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const navigate = useNavigate();

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        handleSendOtp();
      }
    });
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) return alert("Enter a valid phone number");
    setupRecaptcha();

    const appVerifier = window.recaptchaVerifier;
    try {
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, appVerifier);
      setConfirmationResult(result);
      alert('OTP sent!');
    } catch (error) {
      alert('Failed to send OTP: ' + error.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await confirmationResult.confirm(otp);
      alert('Login successful');
      navigate('/');
    } catch (error) {
      alert('Invalid OTP');
    }
  };

  return (
    <div className="otp-body">
      <div className="otp-container">
        <h2>OTP Login</h2>
        <input
          type="text"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div id="recaptcha-container"></div>
        <button onClick={handleSendOtp}>Send OTP</button>

        {confirmationResult && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp}>Verify OTP</button>
          </>
        )}
      </div>
    </div>
  );
}
