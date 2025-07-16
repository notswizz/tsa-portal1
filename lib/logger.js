/**
 * Centralized logging utility for the TSA Portal
 * This provides consistent logging across the application
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

class Logger {
  constructor() {
    this.isDevelopment = isDevelopment;
    this.isProduction = isProduction;
  }

  /**
   * Log informational messages
   */
  info(message, data = null) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  /**
   * Log warning messages
   */
  warn(message, data = null) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  /**
   * Log error messages
   */
  error(message, error = null) {
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '');
    } else if (this.isProduction) {
      // In production, you might want to send errors to a service like Sentry
      // For now, we'll still log to console but with less detail
      console.error(`[ERROR] ${message}`);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message, data = null) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log API errors with context
   */
  apiError(endpoint, error, context = {}) {
    const errorMessage = `API Error in ${endpoint}: ${error.message || error}`;
    this.error(errorMessage, { error, context });
  }

  /**
   * Log database errors
   */
  dbError(operation, error, context = {}) {
    const errorMessage = `Database Error in ${operation}: ${error.message || error}`;
    this.error(errorMessage, { error, context });
  }

  /**
   * Log authentication errors
   */
  authError(operation, error, context = {}) {
    const errorMessage = `Auth Error in ${operation}: ${error.message || error}`;
    this.error(errorMessage, { error, context });
  }
}

// Export a singleton instance
const logger = new Logger();
export default logger;