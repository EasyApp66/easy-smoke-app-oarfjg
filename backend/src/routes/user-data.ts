import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  /**
   * DELETE /api/user-data
   * Delete all user data for GDPR compliance
   */
  fastify.delete(
    '/api/user-data',
    {
      schema: {
        description: 'Delete all user data for GDPR compliance',
        tags: ['user-data'],
        body: {
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
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.body as { deviceId?: string };

      app.logger.info({ deviceId }, 'Deleting user data');

      // Validate deviceId
      if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
        app.logger.warn({}, 'deviceId is required');
        return reply.code(400).send({ error: 'deviceId is required' });
      }

      try {
        // Delete from all three tables
        await app.db
          .delete(schema.userSettings)
          .where(eq(schema.userSettings.deviceId, deviceId));

        await app.db
          .delete(schema.smokingLogs)
          .where(eq(schema.smokingLogs.deviceId, deviceId));

        await app.db
          .delete(schema.scheduledAlarms)
          .where(eq(schema.scheduledAlarms.deviceId, deviceId));

        app.logger.info({ deviceId }, 'User data deleted successfully');
        reply.code(200);
        return { success: true, message: 'All data deleted' };
      } catch (error) {
        app.logger.error({ err: error, deviceId }, 'Failed to delete user data');
        return reply.code(500).send({ error: 'Failed to delete data' });
      }
    }
  );
}
