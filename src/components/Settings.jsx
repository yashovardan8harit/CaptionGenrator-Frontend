// src/pages/Settings.jsx

import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AlertCircle, CheckCircle, KeyRound, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!currentUser?.email) {
      setError("Could not find user's email.");
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setMessage(`A password reset link has been sent to ${currentUser.email}. Please check your inbox.`);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="relative z-10 w-full px-4 flex flex-col items-center justify-start gap-8 py-10">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
        >
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                Settings
            </h1>
            <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-lg p-8 shadow-lg">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
                    <KeyRound className="w-6 h-6 text-purple-400" />
                    Account Security
                </h2>
                <form onSubmit={handlePasswordReset}>
                    <p className="text-neutral-400 mb-4">
                        Click the button below to send a password reset link to your registered email address.
                    </p>
                    <div className="mb-4">
                        <label className="text-sm text-neutral-300">Your Email</label>
                        <input
                            type="email"
                            value={currentUser?.email || ''}
                            disabled
                            className="w-full mt-1 p-2 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-400 cursor-not-allowed"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !currentUser?.email}
                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Send Password Reset Email'
                        )}
                    </button>
                </form>

                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-4 p-3 bg-green-900/30 border border-green-500 rounded-lg flex items-center gap-3 text-sm text-green-300"
                        >
                            <CheckCircle className="h-5 w-5" />
                            {message}
                        </motion.div>
                    )}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-sm text-red-300"
                        >
                            <AlertCircle className="h-5 w-5" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    </div>
  );
};

export default Settings;