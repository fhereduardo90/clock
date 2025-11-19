/**
 * Shared type definitions for the Clock application
 */

/**
 * Interface for clock message configuration
 * Defines the three message types that can be printed
 */
export interface ClockMessages {
  tick: string;
  tock: string;
  bong: string;
}

/**
 * Type for valid message keys
 */
export type MessageKey = keyof ClockMessages;
