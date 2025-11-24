/**
 * Structured JSON Logger for Supabase Edge Functions
 * 
 * Provides structured logging with:
 * - Multiple log levels (debug, info, warn, error)
 * - Correlation ID support for request tracing
 * - JSON output for log aggregation
 * - Timestamp in ISO 8601 format
 * - Metadata attachment
 * 
 * Constitution Compliance:
 * - Observability: Structured logs enable monitoring and debugging
 * - Performance: Minimal overhead, JSON serialization only
 * - Code Quality: Explicit types, JSDoc comments
 */

/**
 * Log level enumeration
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Metadata attached to log entries
 */
export interface LogMetadata {
  [key: string]: unknown;
}

/**
 * Structured log entry format
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  correlation_id?: string;
  metadata?: LogMetadata;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  minLevel: LogLevel;
  correlationId?: string;
  defaultMetadata?: LogMetadata;
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: LogLevel.INFO,
};

/**
 * Generate a unique correlation ID for request tracing
 * Format: UUID v4
 * 
 * @returns Unique correlation ID
 */
export function generateCorrelationId(): string {
  return crypto.randomUUID();
}

/**
 * Structured logger class
 */
export class Logger {
  private config: LoggerConfig;

  /**
   * Create a new logger instance
   * 
   * @param config - Logger configuration
   */
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set correlation ID for this logger instance
   * 
   * @param correlationId - Correlation ID to attach to all logs
   */
  setCorrelationId(correlationId: string): void {
    this.config.correlationId = correlationId;
  }

  /**
   * Get current correlation ID
   * 
   * @returns Current correlation ID or undefined
   */
  getCorrelationId(): string | undefined {
    return this.config.correlationId;
  }

  /**
   * Check if log level should be logged
   * 
   * @param level - Log level to check
   * @returns True if level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Format and output log entry
   * 
   * @param level - Log level
   * @param message - Log message
   * @param metadata - Additional metadata
   * @param error - Error object (for error logs)
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: LogMetadata,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Add correlation ID if set
    if (this.config.correlationId !== undefined) {
      entry.correlation_id = this.config.correlationId;
    }

    // Merge default metadata with provided metadata
    const allMetadata = {
      ...this.config.defaultMetadata,
      ...metadata,
    };

    if (Object.keys(allMetadata).length > 0) {
      entry.metadata = allMetadata;
    }

    // Add error details if provided
    if (error !== undefined) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Output as JSON to stdout
    console.log(JSON.stringify(entry));
  }

  /**
   * Log debug message
   * 
   * @param message - Debug message
   * @param metadata - Additional metadata
   */
  debug(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }

  /**
   * Log info message
   * 
   * @param message - Info message
   * @param metadata - Additional metadata
   */
  info(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.INFO, message, metadata);
  }

  /**
   * Log warning message
   * 
   * @param message - Warning message
   * @param metadata - Additional metadata
   */
  warn(message: string, metadata?: LogMetadata): void {
    this.log(LogLevel.WARN, message, metadata);
  }

  /**
   * Log error message
   * 
   * @param message - Error message
   * @param error - Error object
   * @param metadata - Additional metadata
   */
  error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.log(LogLevel.ERROR, message, metadata, error);
  }

  /**
   * Create child logger with additional default metadata
   * 
   * @param metadata - Default metadata for child logger
   * @returns New logger instance with merged metadata
   */
  child(metadata: LogMetadata): Logger {
    return new Logger({
      ...this.config,
      defaultMetadata: {
        ...this.config.defaultMetadata,
        ...metadata,
      },
    });
  }
}

/**
 * Create a new logger instance
 * 
 * @param config - Logger configuration
 * @returns Logger instance
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

/**
 * Default logger instance for convenience
 * Uses INFO level by default
 */
export const logger = createLogger();

/**
 * Create logger with correlation ID
 * Convenience function for Edge Functions
 * 
 * @param correlationId - Correlation ID for request tracing
 * @returns Logger instance with correlation ID
 */
export function createLoggerWithCorrelation(correlationId?: string): Logger {
  const id = correlationId ?? generateCorrelationId();
  return createLogger({ correlationId: id });
}
