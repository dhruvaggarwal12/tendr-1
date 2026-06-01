import React from 'react';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo }) => {
  // Use window.location instead of useNavigate — ErrorBoundary renders outside
  // RouterProvider so useNavigate has no context and would crash

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Don't worry, our team has been notified and we're working to fix it.
        </p>

        {/* Temporary: show error in production for debugging */}
        {error && (
          <div style={{ background: "#fee2e2", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 11, color: "#b91c1c", textAlign: "left", wordBreak: "break-all" }}>
            <strong>Debug:</strong> {error.toString()}
          </div>
        )}

        {/* Error Details (Development Only) */}
        {import.meta.env.DEV && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="bg-gray-100 rounded-lg p-3 text-xs text-gray-700 overflow-auto max-h-32">
              <div className="font-semibold mb-1">Error:</div>
              <div className="mb-2">{error.toString()}</div>
              {errorInfo && (
                <>
                  <div className="font-semibold mb-1">Stack Trace:</div>
                  <div>{errorInfo.componentStack}</div>
                </>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white py-3 px-6 rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleGoBack}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors duration-300 font-medium flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>

            <button
              onClick={handleRefresh}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors duration-300 font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Still having issues?
          </p>
          <button
            onClick={() => window.open('mailto:support@tendr.com', '_blank')}
            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary; 