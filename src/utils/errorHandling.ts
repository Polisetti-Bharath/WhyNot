/**
 * Enhanced Error Handling Utilities
 * Centralized error handling for better user experience and debugging
 */

export interface ErrorDetails {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  public code?: string;
  public statusCode?: number;
  public details?: any;

  constructor(message: string, code?: string, statusCode?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Parse error into a user-friendly message
 */
export const parseError = (error: unknown): ErrorDetails => {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Handle Supabase errors
  if (typeof error === 'object' && error !== null) {
    const err = error as any;

    // Supabase error format
    if (err.message) {
      return {
        message: err.message,
        code: err.code,
        statusCode: err.status || err.statusCode,
        details: err.details || err.hint,
      };
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }

  // Fallback for unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    details: error,
  };
};

/**
 * Get user-friendly error message based on error code/type
 */
export const getUserFriendlyMessage = (error: ErrorDetails): string => {
  // Network errors
  if (error.message?.toLowerCase().includes('network')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Authentication errors
  if (error.code === 'PGRST301' || error.statusCode === 401) {
    return 'Session expired. Please sign in again.';
  }

  if (error.code === 'PGRST116' || error.statusCode === 403) {
    return 'You do not have permission to perform this action.';
  }

  // Database errors
  if (error.code?.startsWith('23')) {
    // PostgreSQL constraint violations
    if (error.code === '23505') {
      return 'This record already exists. Please try a different value.';
    }
    if (error.code === '23503') {
      return 'This operation cannot be completed due to related data.';
    }
    return 'Database error. Please check your input and try again.';
  }

  // API errors
  if (error.statusCode === 404) {
    return 'The requested resource was not found.';
  }

  if (error.statusCode === 500) {
    return 'Server error. Our team has been notified. Please try again later.';
  }

  if (error.statusCode === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  // Validation errors
  if (error.message?.toLowerCase().includes('invalid')) {
    return 'Invalid input. Please check your data and try again.';
  }

  if (error.message?.toLowerCase().includes('required')) {
    return 'Required field missing. Please fill in all required fields.';
  }

  // Return original message if no specific match
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Log error to console in development or to external service in production
 */
export const logError = (error: unknown, context?: string) => {
  const errorDetails = parseError(error);

  if (import.meta.env.DEV) {
    console.group(`❌ Error${context ? ` in ${context}` : ''}`);
    console.error('Message:', errorDetails.message);
    if (errorDetails.code) console.error('Code:', errorDetails.code);
    if (errorDetails.statusCode) console.error('Status:', errorDetails.statusCode);
    if (errorDetails.details) console.error('Details:', errorDetails.details);
    if (error instanceof Error) console.error('Stack:', error.stack);
    console.groupEnd();
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     extra: { context, ...errorDetails }
    //   });
    // }
    console.error(`Error${context ? ` in ${context}` : ''}:`, errorDetails.message);
  }
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on authentication errors
      const errorDetails = parseError(error);
      if (errorDetails.statusCode === 401 || errorDetails.statusCode === 403) {
        throw error;
      }

      // Don't retry on final attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
    }
  }

  throw lastError;
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error;
    }
  }) as T;
};

/**
 * Handle API error and return user-friendly message
 */
export const handleAPIError = (error: unknown, context?: string): string => {
  logError(error, context);
  const errorDetails = parseError(error);
  return getUserFriendlyMessage(errorDetails);
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  const errorDetails = parseError(error);
  return (
    errorDetails.message?.toLowerCase().includes('network') ||
    errorDetails.message?.toLowerCase().includes('fetch') ||
    errorDetails.message?.toLowerCase().includes('connection')
  );
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  const errorDetails = parseError(error);
  return (
    errorDetails.statusCode === 401 ||
    errorDetails.code === 'PGRST301' ||
    errorDetails.message?.toLowerCase().includes('unauthorized')
  );
};

/**
 * Format error for display in UI
 */
export const formatErrorForDisplay = (
  error: unknown
): {
  title: string;
  message: string;
  action?: string;
} => {
  const errorDetails = parseError(error);
  const message = getUserFriendlyMessage(errorDetails);

  if (isNetworkError(error)) {
    return {
      title: 'Connection Error',
      message,
      action: 'Check your internet connection',
    };
  }

  if (isAuthError(error)) {
    return {
      title: 'Authentication Required',
      message,
      action: 'Please sign in again',
    };
  }

  if (errorDetails.statusCode && errorDetails.statusCode >= 500) {
    return {
      title: 'Server Error',
      message,
      action: 'Try again later',
    };
  }

  return {
    title: 'Error',
    message,
    action: 'Please try again',
  };
};
