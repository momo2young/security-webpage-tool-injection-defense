import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console for debugging
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return fallback UI or default error message
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center h-64 p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Something went wrong
          </div>
          <div className="text-red-500 text-sm mb-4 text-center">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try again
          </button>
          <details className="mt-4 text-xs text-gray-600">
            <summary className="cursor-pointer">Error details</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}