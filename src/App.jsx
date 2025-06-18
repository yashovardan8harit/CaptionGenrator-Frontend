import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Your existing authentication hook - NO CHANGES NEEDED HERE
import { useAuth } from './lib/AuthContext';

// Import the main application layout and all page components
import AppLayout from './layouts/AppLayout';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Login from './components/ui/Login';
import Signup from './components/ui/Signup';

// A nice loader icon for the loading state
import { Loader2 } from 'lucide-react';

function App() {
  // Your authentication logic remains unchanged
  const { currentUser, loading } = useAuth();

  // Show a loading screen while Firebase checks auth state. This is good practice.
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
      {/*
        PUBLIC ROUTES:
        These routes are for users who are NOT logged in.
        If a logged-in user tries to visit /login or /signup, they are
        automatically redirected to the main dashboard.
      */}
      <Route 
        path="/login" 
        element={!currentUser ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/signup" 
        element={!currentUser ? <Signup /> : <Navigate to="/dashboard" replace />} 
      />

      {/*
        PROTECTED ROUTES:
        These routes are for users who ARE logged in. They are wrapped in the
        AppLayout component which provides the sidebar and main content area.
        If a logged-out user tries to visit any of these, they are
        automatically redirected to the /login page.
      */}
      <Route 
        path="/" 
        element={currentUser ? <AppLayout /> : <Navigate to="/login" replace />}
      >
        {/* The index route redirects from "/" to "/dashboard" by default */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* The pages that will render inside the AppLayout's <Outlet /> */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/*
        FALLBACK ROUTE:
        This catches any URL that doesn't match the routes defined above.
        It safely redirects the user to the correct starting page based
        on their login status.
      */}
      <Route 
        path="*" 
        element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

export default App;