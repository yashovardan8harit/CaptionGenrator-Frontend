// src/lib/api.js

// This line reads the VITE_API_BASE_URL from your .env file for production,
// but falls back to localhost for local development.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * A centralized function for making API calls.
 * @param {string} endpoint - The API endpoint (e.g., '/generate-caption').
 * @param {string} token - The user's Firebase auth token.
 * @param {object} options - Additional options for the fetch call (method, body).
 * @returns {Promise<any>} The JSON response from the API.
 */
const apiFetch = async (endpoint, token, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add the Authorization header if a token is provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    // Throw an error with the message from the backend if available
    throw new Error(data.detail || 'An API error occurred.');
  }

  return data;
};

// ===================================================================
// EXPORT specific functions for each of your app's API needs
// This keeps the components clean and unaware of the full API logic.
// ===================================================================

export const fetchStyles = () => {
  return apiFetch('/caption-styles'); // No token needed for this public endpoint
};

export const generateCaption = (imageData, token) => {
  return apiFetch('/generate-caption', token, {
    method: 'POST',
    body: JSON.stringify(imageData),
  });
};

export const fetchHistory = (token) => {
  return apiFetch('/user/history', token); // GET is the default method
};

export const deleteHistoryItem = (historyId, token) => {
  return apiFetch(`/user/history/${historyId}`, token, {
    method: 'DELETE',
  });
};

export const clearAllHistory = (token) => {
  return apiFetch('/user/history', token, {
    method: 'DELETE',
  });
};