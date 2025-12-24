import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email) {
      setIsSubmitted(true);
      console.log('Reset email sent to:', email);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" 
         style={{
           background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 50%, #000000 100%)'
         }}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        {/* Back Button */}
        {!isSubmitted && (
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Sign In</span>
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">S</span>
          </div>
        </div>

        {!isSubmitted ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-500 mb-8">
              No worries, we'll send you reset instructions.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!email}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition duration-200 shadow-lg"
              >
                Send Reset Link
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-500 mb-6">
              We sent a password reset link to<br />
              <span className="font-semibold text-gray-700">{email}</span>
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium underline"
            >
              Didn't receive the email? Click to resend
            </button>
            <div className="mt-6">
              <button
                onClick={() => setIsSubmitted(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mx-auto transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to login</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}