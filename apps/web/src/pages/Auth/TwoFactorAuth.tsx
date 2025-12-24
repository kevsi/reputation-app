import React, { useState, useRef } from 'react';
import { Lock, Shield } from 'lucide-react';

export default function TwoFactorAuth() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    
    setError('');
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

  const handleVerify = () => {
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      console.log('2FA code:', verificationCode);
      // Simulate verification
    } else {
      setError('Please enter all 6 digits');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #000000 100%)'
         }}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-3">Two-Factor Authentication</h1>
        <p className="text-gray-500 mb-10">
          Enter the 6-digit code from your authenticator app.
        </p>

        {/* Code Input */}
        <div className="flex justify-center gap-3 mb-4">
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
              className={`w-16 h-16 text-center text-3xl font-semibold bg-gray-50 border-2 rounded-2xl focus:outline-none focus:bg-white transition-all ${
                error 
                  ? 'border-red-300 text-red-600 focus:border-red-500' 
                  : 'border-gray-200 text-gray-400 focus:border-indigo-500 focus:text-gray-900'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 mb-6">{error}</p>
        )}

        <button
          onClick={handleVerify}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg mb-6"
        >
          Verify Code
          <Lock className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Having trouble?{' '}
            <button className="text-indigo-600 font-semibold hover:text-indigo-700 underline">
              Use backup code
            </button>
          </p>
          <button className="text-sm text-gray-500 hover:text-gray-700">
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}