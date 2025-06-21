// src/pages/Profile.jsx

import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Mail, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { currentUser } = useAuth();

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full px-4 flex flex-col items-center justify-start gap-8 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
          User Profile
        </h1>
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-lg p-8 shadow-lg">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <img
              src={currentUser.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${currentUser.uid}`}
              alt="Profile"
              className="w-24 h-24 rounded-full border-2 border-purple-400"
            />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-white">{currentUser.displayName || 'User'}</h2>
              <div className="mt-4 space-y-4 text-neutral-300">
                {/* Email Address */}
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-neutral-400" />
                  <span>{currentUser.email}</span>
                </div>

                {/* Member Since Date */}
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-neutral-400" />
                  <span>Member since {getFormattedDate(currentUser.metadata.creationTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;