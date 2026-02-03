import { randomBytes } from 'crypto';

/**
 * Generate a random ID using crypto
 * Returns a URL-safe string
 */
export function generateId(): string {
  return randomBytes(12).toString('hex');
}
