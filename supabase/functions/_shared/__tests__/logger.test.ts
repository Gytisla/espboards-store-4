/**
 * Unit tests for structured JSON logger
 * 
 * Tests verify:
 * - Structured JSON output format
 * - Log level filtering
 * - Correlation ID support
 * - Metadata attachment
 * - Error logging with stack traces
 * - Child logger creation
 */

import {
  assertEquals,
  assertExists,
  assertStringIncludes,
} from 'https://deno.land/std@0.208.0/assert/mod.ts';
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from 'https://deno.land/std@0.208.0/testing/bdd.ts';
import {
  createLogger,
  createLoggerWithCorrelation,
  generateCorrelationId,
  Logger,
  LogEntry,
  LogLevel,
  logger,
} from '../logger.ts';

// Capture console.log output for testing
let capturedLogs: string[] = [];
const originalConsoleLog = console.log;

function captureConsoleLog(): void {
  console.log = (...args: unknown[]) => {
    capturedLogs.push(args.join(' '));
  };
}

function restoreConsoleLog(): void {
  console.log = originalConsoleLog;
}

function getLastLog(): LogEntry {
  const lastLog = capturedLogs[capturedLogs.length - 1];
  return JSON.parse(lastLog ?? '{}') as LogEntry;
}

describe('Logger', () => {
  beforeEach(() => {
    capturedLogs = [];
    captureConsoleLog();
  });

  afterEach(() => {
    restoreConsoleLog();
  });

  describe('generateCorrelationId', () => {
    it('should generate a valid UUID v4', () => {
      const id = generateCorrelationId();
      
      assertExists(id);
      assertEquals(typeof id, 'string');
      assertEquals(id.length, 36); // UUID format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      assertStringIncludes(id, '-');
    });

    it('should generate unique IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      
      assertEquals(id1 !== id2, true);
    });
  });

  describe('Logger basic functionality', () => {
    it('should create logger instance', () => {
      const testLogger = createLogger();
      
      assertExists(testLogger);
      assertEquals(testLogger instanceof Logger, true);
    });

    it('should log info message with structured JSON', () => {
      const testLogger = createLogger();
      testLogger.info('Test message');

      assertEquals(capturedLogs.length, 1);
      
      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.INFO);
      assertEquals(logEntry.message, 'Test message');
      assertExists(logEntry.timestamp);
    });

    it('should include timestamp in ISO 8601 format', () => {
      const testLogger = createLogger();
      testLogger.info('Test');

      const logEntry = getLastLog();
      const timestamp = new Date(logEntry.timestamp);
      
      assertEquals(isNaN(timestamp.getTime()), false);
      assertStringIncludes(logEntry.timestamp, 'T');
      assertStringIncludes(logEntry.timestamp, 'Z');
    });
  });

  describe('Log levels', () => {
    it('should log debug messages', () => {
      const testLogger = createLogger({ minLevel: LogLevel.DEBUG });
      testLogger.debug('Debug message');

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.DEBUG);
      assertEquals(logEntry.message, 'Debug message');
    });

    it('should log info messages', () => {
      const testLogger = createLogger();
      testLogger.info('Info message');

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.INFO);
    });

    it('should log warning messages', () => {
      const testLogger = createLogger();
      testLogger.warn('Warning message');

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.WARN);
    });

    it('should log error messages', () => {
      const testLogger = createLogger();
      testLogger.error('Error message');

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.ERROR);
    });

    it('should filter logs below minimum level', () => {
      const testLogger = createLogger({ minLevel: LogLevel.WARN });
      
      testLogger.debug('Should not appear');
      testLogger.info('Should not appear');
      assertEquals(capturedLogs.length, 0);

      testLogger.warn('Should appear');
      assertEquals(capturedLogs.length, 1);

      testLogger.error('Should appear');
      assertEquals(capturedLogs.length, 2);
    });
  });

  describe('Correlation ID support', () => {
    it('should set and get correlation ID', () => {
      const testLogger = createLogger();
      const correlationId = 'test-correlation-123';
      
      testLogger.setCorrelationId(correlationId);
      assertEquals(testLogger.getCorrelationId(), correlationId);
    });

    it('should include correlation ID in log entries', () => {
      const testLogger = createLogger();
      const correlationId = 'test-correlation-456';
      
      testLogger.setCorrelationId(correlationId);
      testLogger.info('Test message');

      const logEntry = getLastLog();
      assertEquals(logEntry.correlation_id, correlationId);
    });

    it('should create logger with correlation ID', () => {
      const correlationId = 'preset-correlation-789';
      const testLogger = createLogger({ correlationId });
      
      testLogger.info('Test message');

      const logEntry = getLastLog();
      assertEquals(logEntry.correlation_id, correlationId);
    });

    it('should auto-generate correlation ID with helper', () => {
      const testLogger = createLoggerWithCorrelation();
      
      testLogger.info('Test message');

      const logEntry = getLastLog();
      assertExists(logEntry.correlation_id);
      assertEquals(typeof logEntry.correlation_id, 'string');
    });
  });

  describe('Metadata support', () => {
    it('should attach metadata to log entries', () => {
      const testLogger = createLogger();
      const metadata = { userId: 123, action: 'test' };
      
      testLogger.info('Test message', metadata);

      const logEntry = getLastLog();
      assertExists(logEntry.metadata);
      assertEquals(logEntry.metadata?.['userId'], 123);
      assertEquals(logEntry.metadata?.['action'], 'test');
    });

    it('should support complex metadata objects', () => {
      const testLogger = createLogger();
      const metadata = {
        nested: { key: 'value' },
        array: [1, 2, 3],
        boolean: true,
        number: 42,
      };
      
      testLogger.info('Test message', metadata);

      const logEntry = getLastLog();
      assertEquals(logEntry.metadata?.['nested'], { key: 'value' });
      assertEquals(logEntry.metadata?.['array'], [1, 2, 3]);
      assertEquals(logEntry.metadata?.['boolean'], true);
      assertEquals(logEntry.metadata?.['number'], 42);
    });

    it('should support default metadata', () => {
      const defaultMetadata = { service: 'test-service', version: '1.0.0' };
      const testLogger = createLogger({ defaultMetadata });
      
      testLogger.info('Test message', { requestId: 'abc' });

      const logEntry = getLastLog();
      assertEquals(logEntry.metadata?.['service'], 'test-service');
      assertEquals(logEntry.metadata?.['version'], '1.0.0');
      assertEquals(logEntry.metadata?.['requestId'], 'abc');
    });

    it('should merge default and provided metadata', () => {
      const defaultMetadata = { service: 'test-service' };
      const testLogger = createLogger({ defaultMetadata });
      
      testLogger.info('Test', { extra: 'data' });

      const logEntry = getLastLog();
      assertEquals(logEntry.metadata?.['service'], 'test-service');
      assertEquals(logEntry.metadata?.['extra'], 'data');
    });
  });

  describe('Error logging', () => {
    it('should log error with error object', () => {
      const testLogger = createLogger();
      const error = new Error('Test error');
      
      testLogger.error('Error occurred', error);

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.ERROR);
      assertExists(logEntry.error);
      assertEquals(logEntry.error?.name, 'Error');
      assertEquals(logEntry.error?.message, 'Test error');
      assertExists(logEntry.error?.stack);
    });

    it('should log error without error object', () => {
      const testLogger = createLogger();
      
      testLogger.error('Error message only');

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.ERROR);
      assertEquals(logEntry.message, 'Error message only');
      assertEquals(logEntry.error, undefined);
    });

    it('should include custom error types', () => {
      const testLogger = createLogger();
      
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }
      
      const error = new CustomError('Custom error message');
      testLogger.error('Custom error occurred', error);

      const logEntry = getLastLog();
      assertEquals(logEntry.error?.name, 'CustomError');
      assertEquals(logEntry.error?.message, 'Custom error message');
    });

    it('should log error with metadata', () => {
      const testLogger = createLogger();
      const error = new Error('Test error');
      const metadata = { context: 'testing', attempt: 1 };
      
      testLogger.error('Error with context', error, metadata);

      const logEntry = getLastLog();
      assertExists(logEntry.error);
      assertExists(logEntry.metadata);
      assertEquals(logEntry.metadata?.['context'], 'testing');
      assertEquals(logEntry.metadata?.['attempt'], 1);
    });
  });

  describe('Child logger', () => {
    it('should create child logger with additional metadata', () => {
      const parentLogger = createLogger({ defaultMetadata: { service: 'parent' } });
      const childLogger = parentLogger.child({ component: 'child' });
      
      childLogger.info('Child message');

      const logEntry = getLastLog();
      assertEquals(logEntry.metadata?.['service'], 'parent');
      assertEquals(logEntry.metadata?.['component'], 'child');
    });

    it('should inherit correlation ID from parent', () => {
      const correlationId = 'parent-correlation';
      const parentLogger = createLogger({ correlationId });
      const childLogger = parentLogger.child({ component: 'child' });
      
      childLogger.info('Test');

      const logEntry = getLastLog();
      assertEquals(logEntry.correlation_id, correlationId);
    });

    it('should allow multiple child loggers', () => {
      const parentLogger = createLogger();
      const child1 = parentLogger.child({ component: 'child1' });
      const child2 = parentLogger.child({ component: 'child2' });
      
      child1.info('From child 1');
      let logEntry = getLastLog();
      assertEquals(logEntry.metadata?.['component'], 'child1');

      child2.info('From child 2');
      logEntry = getLastLog();
      assertEquals(logEntry.metadata?.['component'], 'child2');
    });
  });

  describe('Default logger instance', () => {
    it('should export default logger instance', () => {
      assertExists(logger);
      assertEquals(logger instanceof Logger, true);
    });

    it('should use default logger for quick logging', () => {
      logger.info('Quick log');

      const logEntry = getLastLog();
      assertEquals(logEntry.level, LogLevel.INFO);
      assertEquals(logEntry.message, 'Quick log');
    });
  });

  describe('JSON output format', () => {
    it('should output valid JSON', () => {
      const testLogger = createLogger();
      testLogger.info('Test');

      const logString = capturedLogs[0];
      
      // Should not throw
      const parsed = JSON.parse(logString ?? '{}');
      assertExists(parsed);
    });

    it('should include all required fields', () => {
      const testLogger = createLogger();
      testLogger.info('Test', { extra: 'data' });

      const logEntry = getLastLog();
      
      assertExists(logEntry.timestamp);
      assertExists(logEntry.level);
      assertExists(logEntry.message);
      assertEquals(typeof logEntry.timestamp, 'string');
      assertEquals(typeof logEntry.level, 'string');
      assertEquals(typeof logEntry.message, 'string');
    });
  });
});
