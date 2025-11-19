/**
 * Zod validation schemas for request validation
 */

import { z } from 'zod';

/**
 * Schema for validating individual clock messages
 * - Must be a non-empty string
 * - Maximum 100 characters
 * - Cannot be only whitespace
 */
export const MessageSchema = z
  .string()
  .min(1)
  .max(100)
  .refine((val) => val.trim().length > 0);

/**
 * Schema for validating configuration update requests
 * Allows partial updates with optional tick, tock, and bong fields
 */
export const ConfigUpdateSchema = z.object({
  tick: MessageSchema.optional(),
  tock: MessageSchema.optional(),
  bong: MessageSchema.optional(),
});
