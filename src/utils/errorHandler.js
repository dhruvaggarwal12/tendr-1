// Error handling utilities for better UX
import React from 'react';
import ErrorPage from '../components/ErrorPage';

export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);

  // Determine error type and provide user-friendly message
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      type: 'network',
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection and try again.',
      userAction: 'Check your internet connection and refresh the page.'
    };
  }

  if (error.status === 401) {
    return {
      type: 'auth',
      title: 'Authentication Required',
      message: 'Please log in to continue.',
      userAction: 'Please sign in to your account.'
    };
  }

  if (error.status === 403) {
    return {
      type: 'permission',
      title: 'Access Denied',
      message: 'You don\'t have permission to perform this action.',
      userAction: 'Contact support if you believe this is an error.'
    };
  }

  if (error.status === 404) {
    return {
      type: 'notFound',
      title: 'Resource Not Found',
      message: 'The requested resource could not be found.',
      userAction: 'Please check the URL or go back to the previous page.'
    };
  }

  if (error.status >= 500) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Something went wrong on our end. We\'re working to fix it.',
      userAction: 'Please try again in a few minutes.'
    };
  }

  // Default error
  return {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: error.message || 'An unexpected error occurred.',
    userAction: 'Please try again or contact support if the problem persists.'
  };
};

export const showErrorToast = (errorInfo) => {
  // Create a toast notification for errors
  const toast = document.createElement('div');
  toast.className = `
    fixed top-4 right-4 z-50 max-w-sm w-full bg-red-50 border border-red-200 rounded-lg shadow-lg p-4
    transform transition-all duration-300 translate-x-full
  `;
  
  toast.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-red-800">${errorInfo.title}</h3>
        <p class="mt-1 text-sm text-red-700">${errorInfo.message}</p>
      </div>
      <div class="ml-4 flex-shrink-0 flex">
        <button onclick="this.parentElement.parentElement.parentElement.remove()" class="text-red-400 hover:text-red-600">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.classList.remove('translate-x-full');
  }, 100);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('translate-x-full');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 300);
  }, 5000);
};

export const createErrorBoundary = (Component, fallback) => {
  return class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return fallback ? fallback(this.state.error) : React.createElement(ErrorPage);
      }

      return React.createElement(Component, this.props);
    }
  };
};

// Detect Vite/Rollup chunk-load failures (happen after a new Vercel deploy)
const isChunkError = (err) => {
  if (!err) return false;
  const msg = (err.message || err.toString() || "").toLowerCase();
  return (
    msg.includes("failed to fetch dynamically imported module") ||
    msg.includes("loading chunk") ||
    msg.includes("loading css chunk") ||
    msg.includes("chunkloaderror") ||
    err.name === "ChunkLoadError"
  );
};

// Global error handler for unhandled promise rejections
export const setupGlobalErrorHandling = () => {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;

    // Auto-reload once when a chunk fails to load — happens after new deploy
    // because old cached HTML references old chunk hashes that no longer exist
    if (isChunkError(reason)) {
      event.preventDefault();
      if (!sessionStorage.getItem("tendr_chunk_reloaded")) {
        sessionStorage.setItem("tendr_chunk_reloaded", "1");
        window.location.reload();
      }
      return;
    }

    // Suppress React Router context errors — FloatingChatButton/VendorChatModal
    // render outside RouterProvider but already use router.navigate() directly
    const msg = (reason?.message || "").toLowerCase();
    if (msg.includes("usenavigate") || msg.includes("uselocation") || msg.includes("context of a router")) {
      event.preventDefault();
      return;
    }

    console.error('Unhandled promise rejection:', reason);
    const errorInfo = handleApiError(reason, 'Global');
    showErrorToast(errorInfo);
    event.preventDefault();
  });

  window.addEventListener('error', (event) => {
    if (isChunkError(event.error)) {
      if (!sessionStorage.getItem("tendr_chunk_reloaded")) {
        sessionStorage.setItem("tendr_chunk_reloaded", "1");
        window.location.reload();
      }
      return;
    }
    // Suppress router context errors (same as above)
    const msg = (event.error?.message || "").toLowerCase();
    if (msg.includes("usenavigate") || msg.includes("uselocation") || msg.includes("context of a router")) {
      return;
    }
    console.error('Global error:', event.error);
    const errorInfo = handleApiError(event.error, 'Global');
    showErrorToast(errorInfo);
  });
}; 