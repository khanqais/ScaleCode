'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StyledForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/organize';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send verification code');
        setLoading(false);
        return;
      }

      setSuccess('Verification code sent to your email!');
      setLoading(false);
      setShowOtpModal(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    try {
      
      const signInResult = await signIn('credentials', {
        email,
        otp,
        redirect: false,
      });

      if (signInResult?.error) {
        setOtpError(signInResult.error === 'CredentialsSignin' 
          ? 'Invalid or expired verification code' 
          : signInResult.error);
        setOtpLoading(false);
      } else if (signInResult?.ok) {
        router.push(callbackUrl);
      } else {
        setOtpError('Something went wrong. Please try again.');
        setOtpLoading(false);
      }
    } catch {
      setOtpError('Something went wrong. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gray-900/70 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
        <h2 className="text-center text-xl font-bold text-white mb-4">
          Continue with
        </h2>
        
        {/* OAuth Buttons - Top */}
        <div className="flex flex-col gap-2 mb-4">
          <button
            type="button"
            aria-label="Log in with Google"
            onClick={() => handleOAuthSignIn('google')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-600/50 bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-white font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4 fill-white">
              <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z" />
            </svg>
            Continue with Google
          </button>
          <button
            type="button"
            aria-label="Log in with GitHub"
            onClick={() => handleOAuthSignIn('github')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-600/50 bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-white font-medium text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-4 h-4 fill-white">
              <path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px bg-gray-600/50 flex-1" />
          <span className="text-xs text-gray-500">Or</span>
          <div className="h-px bg-gray-600/50 flex-1" />
        </div>
        
        {/* Error/Success Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-50 rounded text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-900 bg-opacity-20 border border-green-500 border-opacity-50 rounded text-green-400 text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-3" onSubmit={handleEmailSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
              Enter your email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleInputChange}
                required
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded transition-colors"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Sending code...
              </>
            ) : (
              'Continue with email'
            )}
          </button>
        </form>

        {/* OTP Verification Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOtpModal(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
              >
                <div className="bg-gray-900/70 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 shadow-2xl">
                  <h2 className="text-center text-xl font-bold text-white mb-2">
                    Enter Verification Code
                  </h2>
                  <p className="text-center text-sm text-gray-400 mb-4">
                    We sent a 6-digit code to {email}
                  </p>

                  <AnimatePresence mode="wait">
                    {otpError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-red-900 bg-opacity-20 border border-red-500 border-opacity-50 rounded text-red-400 text-sm"
                      >
                        {otpError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleOtpVerify} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setOtp(value);
                          setOtpError('');
                        }}
                        required
                        maxLength={6}
                        placeholder="000000"
                        className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest rounded-lg bg-gray-800/50 border border-gray-600/50 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/70 focus:ring-1 focus:ring-purple-500/50"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowOtpModal(false);
                          setOtp('');
                          setOtpError('');
                        }}
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-600/50 bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-white font-medium text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={otpLoading || otp.length !== 6}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
                      >
                        {otpLoading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          'Verify'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StyledForm;
