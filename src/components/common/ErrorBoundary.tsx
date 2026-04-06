import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * Enhanced Error Boundary component with improved error handling and accessibility
 */
class ErrorBoundary extends React.Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // Log to error tracking service (e.g., Sentry) in production
      if (import.meta.env.PROD) {
    }

    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: this.state.retryCount + 1,
    });
    window.location.href = '/';
  };

  private handleReload = () => {
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1,
    }));
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-black text-white p-6"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-2xl w-full text-center">
            <div className="mb-8">
              <AlertTriangle className="w-24 h-24 text-rose-400 mx-auto mb-6" aria-hidden="true" />
              <h1 className="text-4xl font-bold mb-4">Oops! Something went wrong</h1>
              <p className="text-slate-400 text-lg mb-2">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>
              <p className="text-slate-500 text-sm">
                Try reloading the page or returning to the home page.
              </p>

              {this.state.retryCount > 0 && (
                <p className="text-sm text-purple-400 mt-4 font-medium">
                  Retry attempts: {this.state.retryCount}
                </p>
              )}

              {this.state.error && import.meta.env.DEV && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-400 mb-2 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1">
                    Technical Details (Development Only)
                  </summary>
                  <pre className="bg-slate-900 p-4 rounded-lg text-xs text-rose-400 overflow-auto max-h-40 border border-slate-800">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent Stack:\n'}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Reload page"
              >
                <RefreshCw className="w-5 h-5" aria-hidden="true" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 rounded-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                aria-label="Go to home page"
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
