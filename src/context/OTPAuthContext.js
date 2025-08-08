import React, { createContext, useContext, useState } from 'react';

const OTPAuthContext = createContext();

export const useOTPAuth = () => useContext(OTPAuthContext);

export function OTPAuthProvider({ children }) {
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [generatedOTP, setGeneratedOTP] = useState(null);
  const [phone, setPhone] = useState('');

  const sendOTP = (phoneNumber) => {
    setPhone(phoneNumber);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔐 OTP:', otp); // simulate sending
    setGeneratedOTP(otp);
    setOtpSent(true);
  };

  const verifyOTP = (enteredOTP) => {
    if (enteredOTP === generatedOTP) {
      setVerified(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid OTP' };
  };

  const logoutOTP = () => {
    setOtpSent(false);
    setVerified(false);
    setGeneratedOTP(null);
    setPhone('');
  };

  return (
    <OTPAuthContext.Provider value={{
      otpSent,
      verified,
      phone,
      sendOTP,
      verifyOTP,
      logoutOTP
    }}>
      {children}
    </OTPAuthContext.Provider>
  );
}
