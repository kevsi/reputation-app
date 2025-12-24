import React, { useState, useRef, useEffect } from 'react';
import { Mail } from 'lucide-react';

export default function VerifyEmail() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/\D/g, '');
    const newCode = [...pastedData.split(''), ...Array(6).fill('')].slice(0, 6);
    setCode(newCode);
    
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleResend = () => {
    setCountdown(60);
    setCode(['', '', '', '', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');
    console.log('Email verification code:', verificationCode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #000000 100%)'
         }}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">Verify Your Email</h1>
        <p className="text-gray-500 mb-10">
          We sent a verification code to your email.<br />
          Please enter the 6-digit code below.
        </p>

        {/* Code Input */}
        <div className="flex justify-center gap-3 mb-8">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                if (el) inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-16 h-16 text-center text-3xl font-semibold text-gray-400 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:text-gray-900 transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg mb-6"
        >
          Verify Email
          <Mail className="w-5 h-5" />
        </button>

        <p className="text-center text-sm text-gray-600">
          Didn't receive the code?{' '}
          {countdown > 0 ? (
            <span className="text-indigo-600 font-semibold">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-indigo-600 font-semibold hover:text-indigo-700 underline"
            >
              Resend code
            </button>
          )}
        </p>
      </div>
    </div>
  );
}