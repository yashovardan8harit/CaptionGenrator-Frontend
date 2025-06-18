import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './lib/AuthContext';

// 1. Import BrowserRouter from react-router-dom
import { BrowserRouter } from 'react-router-dom';

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    {/* The AuthProvider makes user data available to the whole app */}
    <AuthProvider>
      {/* 
        2. The BrowserRouter enables routing for the whole app.
           It must be an ancestor of any component that uses routing
           features like <Routes>, <Route>, or <Link>.
      */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);