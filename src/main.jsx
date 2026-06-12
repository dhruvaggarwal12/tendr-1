import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Provider } from 'react-redux'
import store from './store.js'
import { setupGlobalErrorHandling } from './utils/errorHandler.js'
import './index.css'

// Setup global error handling
setupGlobalErrorHandling();

// Disable browser's automatic scroll restoration so SPA pages can restore manually via sessionStorage
window.history.scrollRestoration = 'manual';

// Global 401 interceptor — if a deleted user makes any API call,
// their session is cleared automatically and they must sign up again
const _originalFetch = window.fetch;
window.fetch = async (...args) => {
  const res = await _originalFetch(...args);
  if (res.status === 401) {
    const { auth } = store.getState();
    if (auth.token) {
      const clone = res.clone();
      const body = await clone.json().catch(() => ({}));
      if (body.error === 'Authentication required' || body.error === 'Consumer not found' || body.error?.includes('not found')) {
        store.dispatch({ type: 'auth/logout/fulfilled' });
      }
    }
  }
  return res;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)