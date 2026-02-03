import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { generateId } from '../utils/id.js';

export function register(app: App, fastify: FastifyInstance) {
  /**
   * GET /api/settings/:deviceId
   * Get user settings by device ID
   */
  fastify.get(
    '/api/settings/:deviceId',
    {
      schema: {
        description: 'Get user settings by device ID',
        tags: ['settings'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string', description: 'Device ID' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              wakeTime: { type: 'string' },
              sleepTime: { type: 'string' },
              dailyCigaretteGoal: { type: 'integer' },
              language: { type: 'string' },
              backgroundColor: { type: 'string' },
              premiumEnabled: { type: 'boolean' },
              promoCode: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params as { deviceId: string };
      app.logger.info({ deviceId }, 'Fetching user settings');

      const settings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.deviceId, deviceId),
      });

      if (!settings) {
        app.logger.info({ deviceId }, 'Settings not found');
        return reply.code(404).send({ error: 'Settings not found' });
      }

      app.logger.info({ deviceId, settingsId: settings.id }, 'Settings retrieved successfully');
      return settings;
    }
  );

  /**
   * POST /api/settings
   * Create or update user settings
   */
  fastify.post(
    '/api/settings',
    {
      schema: {
        description: 'Create or update user settings',
        tags: ['settings'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            wakeTime: { type: 'string' },
            sleepTime: { type: 'string' },
            dailyCigaretteGoal: { type: 'integer' },
            language: { type: 'string' },
            backgroundColor: { type: 'string' },
            premiumEnabled: { type: 'boolean' },
            promoCode: { type: 'string' },
          },
          required: ['deviceId', 'wakeTime', 'sleepTime', 'dailyCigaretteGoal'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              wakeTime: { type: 'string' },
              sleepTime: { type: 'string' },
              dailyCigaretteGoal: { type: 'integer' },
              language: { type: 'string' },
              backgroundColor: { type: 'string' },
              premiumEnabled: { type: 'boolean' },
              promoCode: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        deviceId,
        wakeTime,
        sleepTime,
        dailyCigaretteGoal,
        language = 'de',
        backgroundColor = 'gray',
        premiumEnabled = false,
        promoCode = null,
      } = request.body as {
        deviceId: string;
        wakeTime: string;
        sleepTime: string;
        dailyCigaretteGoal: number;
        language?: string;
        backgroundColor?: string;
        premiumEnabled?: boolean;
        promoCode?: string | null;
      };

      app.logger.info(
        { deviceId, wakeTime, sleepTime, dailyCigaretteGoal },
        'Creating or updating user settings'
      );

      // Check if settings already exist
      const existingSettings = await app.db.query.userSettings.findFirst({
        where: eq(schema.userSettings.deviceId, deviceId),
      });

      let settings;

      if (existingSettings) {
        // Update existing settings
        const [updated] = await app.db
          .update(schema.userSettings)
          .set({
            wakeTime,
            sleepTime,
            dailyCigaretteGoal,
            language,
            backgroundColor,
            premiumEnabled,
            promoCode: promoCode || null,
          })
          .where(eq(schema.userSettings.deviceId, deviceId))
          .returning();

        settings = updated;
        app.logger.info({ deviceId, settingsId: settings.id }, 'User settings updated');
      } else {
        // Create new settings
        const settingsId = generateId();
        const [created] = await app.db
          .insert(schema.userSettings)
          .values({
            id: settingsId,
            deviceId,
            wakeTime,
            sleepTime,
            dailyCigaretteGoal,
            language,
            backgroundColor,
            premiumEnabled,
            promoCode: promoCode || null,
          })
          .returning();

        settings = created;
        app.logger.info({ deviceId, settingsId }, 'User settings created');
      }

      reply.code(200);
      return settings;
    }
  );

  /**
   * PUT /api/settings/:deviceId
   * Update specific settings fields
   */
  fastify.put(
    '/api/settings/:deviceId',
    {
      schema: {
        description: 'Update specific settings fields',
        tags: ['settings'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        body: {
          type: 'object',
          properties: {
            wakeTime: { type: 'string' },
            sleepTime: { type: 'string' },
            dailyCigaretteGoal: { type: 'integer' },
            language: { type: 'string' },
            backgroundColor: { type: 'string' },
            premiumEnabled: { type: 'boolean' },
            promoCode: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              wakeTime: { type: 'string' },
              sleepTime: { type: 'string' },
              dailyCigaretteGoal: { type: 'integer' },
              language: { type: 'string' },
              backgroundColor: { type: 'string' },
              premiumEnabled: { type: 'boolean' },
              promoCode: { type: ['string', 'null'] },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params as { deviceId: string };
      const updates = request.body as Record<string, unknown>;

      app.logger.info({ deviceId, updates }, 'Updating user settings');

      // Build update object with only provided fields
      const updateData: Record<string, unknown> = {};
      if (updates.wakeTime !== undefined) updateData.wakeTime = updates.wakeTime;
      if (updates.sleepTime !== undefined) updateData.sleepTime = updates.sleepTime;
      if (updates.dailyCigaretteGoal !== undefined)
        updateData.dailyCigaretteGoal = updates.dailyCigaretteGoal;
      if (updates.language !== undefined) updateData.language = updates.language;
      if (updates.backgroundColor !== undefined) updateData.backgroundColor = updates.backgroundColor;
      if (updates.premiumEnabled !== undefined) updateData.premiumEnabled = updates.premiumEnabled;
      if (updates.promoCode !== undefined)
        updateData.promoCode = updates.promoCode || null;

      const [updated] = await app.db
        .update(schema.userSettings)
        .set(updateData as any)
        .where(eq(schema.userSettings.deviceId, deviceId))
        .returning();

      if (!updated) {
        app.logger.warn({ deviceId }, 'Settings not found for update');
        return reply.code(404).send({ error: 'Settings not found' });
      }

      app.logger.info({ deviceId, settingsId: updated.id }, 'User settings updated successfully');
      return updated;
    }
  );
}
