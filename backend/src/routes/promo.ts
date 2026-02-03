import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

// Valid promo codes configuration
const VALID_PROMO_CODES: Record<string, { enabled: boolean; type: 'lifetime' | 'discount' }> = {
  // Placeholder - admin can add codes here
  // Format: 'CODE': { enabled: true, type: 'lifetime' }
};

export function register(app: App, fastify: FastifyInstance) {
  /**
   * POST /api/promo/validate
   * Validate promo code and enable premium if valid
   */
  fastify.post(
    '/api/promo/validate',
    {
      schema: {
        description: 'Validate promo code and enable premium',
        tags: ['promo'],
        body: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            deviceId: { type: 'string' },
          },
          required: ['code', 'deviceId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              message: { type: 'string' },
              premiumEnabled: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { code, deviceId } = request.body as { code: string; deviceId: string };
      app.logger.info({ deviceId, code }, 'Validating promo code');

      const normalizedCode = code.toUpperCase().trim();

      // Check if code is valid
      const isValid = VALID_PROMO_CODES[normalizedCode]?.enabled === true;

      if (!isValid) {
        app.logger.warn({ deviceId, code: normalizedCode }, 'Invalid promo code');
        return {
          valid: false,
          message: 'Promo code is not valid or has expired',
          premiumEnabled: false,
        };
      }

      // Update user settings to enable premium
      const settings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.deviceId, deviceId),
      });

      if (!settings) {
        app.logger.warn({ deviceId }, 'Settings not found for promo validation');
        return {
          valid: false,
          message: 'User settings not found',
          premiumEnabled: false,
        };
      }

      // Update settings with promo code and premium enabled
      const [updated] = await app.db
        .update(schema.userSettings)
        .set({
          premiumEnabled: true,
          promoCode: normalizedCode,
        })
        .where(eq(schema.userSettings.deviceId, deviceId))
        .returning();

      app.logger.info(
        { deviceId, code: normalizedCode, settingsId: updated.id },
        'Promo code validated and premium enabled'
      );

      return {
        valid: true,
        message: 'Promo code applied successfully! Premium features are now enabled.',
        premiumEnabled: true,
      };
    }
  );
}
