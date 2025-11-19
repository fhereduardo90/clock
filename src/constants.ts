/**
 * Application-wide constants and default values
 */

import { ClockMessages } from './types';

/**
 * Default messages for clock output
 */
export const DEFAULT_MESSAGES: ClockMessages = {
  tick: 'tick',
  tock: 'tock',
  bong: 'bong',
} as const;

/**
 * Server configuration defaults
 */
export const DEFAULT_PORT = 3000;

/**
 * Timing configuration
 */
export const CLOCK_TICK_INTERVAL_MS = 100;
export const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

/**
 * Shutdown configuration
 */
export const DEFAULT_SHUTDOWN_HOURS = 3;
