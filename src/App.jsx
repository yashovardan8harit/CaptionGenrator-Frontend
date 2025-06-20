// src/App.jsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Your existing authentication hook
import { useAuth } from './lib/AuthContext';

// Import the main application layout and all page components
// NOTE: Ensure these paths match your project structure.
import AppLayout from './layouts/AppLayout';
import Dashboard from './components/Dashboard';
import History from './components/History'; // <-- ADD THIS IMPORT
import Profile from './components/Profile';
import Settings from './components/Settings';
import Login from './components/ui/Login';
import Signup from './components/ui/Signup';

// A nice loader icon for the loading state
import { Loader2 } from 'lucide-react';

function App() {
  const { currentUser, loading } = useAuth();

  // Show a loading screen while Firebase checks auth state.
  if (loading) {
    return (
      <div className="h-screen w-screen flex justify-center items-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="text-neutral-400 ml-4">Authenticating...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route 
        path="/login" 
        element={!currentUser ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/signup" 
        element={!currentUser ? <Signup /> : <Navigate to="/dashboard" replace />} 
      />

      {/* PROTECTED ROUTES */}
      <Route 
        path="/" 
        element={currentUser ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="history" element={<History />} /> {/* <-- ADD THIS ROUTE */}
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* FALLBACK ROUTE */}
      <Route 
        path="*" 
        element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;