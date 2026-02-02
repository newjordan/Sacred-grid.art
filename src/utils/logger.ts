/**
 * Centralized logging utility for Sacred Grid
 *
 * In production builds, debug/info logs are suppressed.
 * Error and warn logs are always shown.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isDevelopment = process.env.NODE_ENV === 'development';

const defaultConfig: LoggerConfig = {
  enabled: isDevelopment,
  level: isDevelopment ? 'debug' : 'warn',
  prefix: '[SacredGrid]',
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled && level !== 'error') {
      return false;
    }
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    return `${this.config.prefix} [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    // Errors are always logged
    console.error(this.formatMessage('error', message), ...args);
  }

  /**
   * Create a child logger with a custom prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix}[${prefix}]`,
    });
  }

  /**
   * Temporarily enable logging (useful for debugging specific issues)
   */
  enable(): void {
    this.config.enabled = true;
  }

  /**
   * Disable logging
   */
  disable(): void {
    this.config.enabled = false;
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export the class for creating child loggers
export { Logger };

// Export convenience functions
export const debug = (message: string, ...args: unknown[]) => logger.debug(message, ...args);
export const info = (message: string, ...args: unknown[]) => logger.info(message, ...args);
export const warn = (message: string, ...args: unknown[]) => logger.warn(message, ...args);
export const error = (message: string, ...args: unknown[]) => logger.error(message, ...args);
