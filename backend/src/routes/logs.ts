import type { FastifyInstance } from 'fastify';
import { eq, and, desc } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { generateId } from '../utils/id.js';

export function register(app: App, fastify: FastifyInstance) {
  /**
   * GET /api/logs/:deviceId
   * Get all smoking logs for a device
   */
  fastify.get(
    '/api/logs/:deviceId',
    {
      schema: {
        description: 'Get all smoking logs for a device',
        tags: ['logs'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                deviceId: { type: 'string' },
                date: { type: 'string' },
                cigarettesSmoked: { type: 'integer' },
                cigarettesGoal: { type: 'integer' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params as { deviceId: string };
      app.logger.info({ deviceId }, 'Fetching smoking logs');

      const logs = await app.db
        .select()
        .from(schema.smokingLogs)
        .where(eq(schema.smokingLogs.deviceId, deviceId))
        .orderBy(desc(schema.smokingLogs.date));

      app.logger.info({ deviceId, count: logs.length }, 'Smoking logs retrieved');
      return logs;
    }
  );

  /**
   * GET /api/logs/:deviceId/:date
   * Get log for a specific date (format YYYY-MM-DD)
   */
  fastify.get(
    '/api/logs/:deviceId/:date',
    {
      schema: {
        description: 'Get log for specific date',
        tags: ['logs'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          },
          required: ['deviceId', 'date'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              date: { type: 'string' },
              cigarettesSmoked: { type: 'integer' },
              cigarettesGoal: { type: 'integer' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId, date } = request.params as { deviceId: string; date: string };
      app.logger.info({ deviceId, date }, 'Fetching smoking log for date');

      const log = await app.db.query.smokingLogs.findFirst({
        where: and(eq(schema.smokingLogs.deviceId, deviceId), eq(schema.smokingLogs.date, date)),
      });

      if (log) {
        app.logger.info({ deviceId, date, logId: log.id }, 'Smoking log retrieved');
        return log;
      }

      app.logger.info({ deviceId, date }, 'Log not found, returning empty record');
      // Return empty log if doesn't exist
      return {
        id: generateId(),
        deviceId,
        date,
        cigarettesSmoked: 0,
        cigarettesGoal: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  );

  /**
   * POST /api/logs
   * Create or update log for a date
   */
  fastify.post(
    '/api/logs',
    {
      schema: {
        description: 'Create or update smoking log for a date',
        tags: ['logs'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            cigarettesSmoked: { type: 'integer' },
            cigarettesGoal: { type: 'integer' },
          },
          required: ['deviceId', 'date', 'cigarettesSmoked', 'cigarettesGoal'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              date: { type: 'string' },
              cigarettesSmoked: { type: 'integer' },
              cigarettesGoal: { type: 'integer' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId, date, cigarettesSmoked, cigarettesGoal } = request.body as {
        deviceId: string;
        date: string;
        cigarettesSmoked: number;
        cigarettesGoal: number;
      };

      app.logger.info(
        { deviceId, date, cigarettesSmoked, cigarettesGoal },
        'Creating or updating smoking log'
      );

      // Check if log already exists
      const existingLog = await app.db.query.smokingLogs.findFirst({
        where: and(eq(schema.smokingLogs.deviceId, deviceId), eq(schema.smokingLogs.date, date)),
      });

      let log;

      if (existingLog) {
        // Update existing log
        const [updated] = await app.db
          .update(schema.smokingLogs)
          .set({
            cigarettesSmoked,
            cigarettesGoal,
          })
          .where(and(eq(schema.smokingLogs.deviceId, deviceId), eq(schema.smokingLogs.date, date)))
          .returning();

        log = updated;
        app.logger.info({ deviceId, date, logId: log.id }, 'Smoking log updated');
      } else {
        // Create new log
        const logId = generateId();
        const [created] = await app.db
          .insert(schema.smokingLogs)
          .values({
            id: logId,
            deviceId,
            date,
            cigarettesSmoked,
            cigarettesGoal,
          })
          .returning();

        log = created;
        app.logger.info({ deviceId, date, logId }, 'Smoking log created');
      }

      reply.code(200);
      return log;
    }
  );

  /**
   * PUT /api/logs/:deviceId/:date/increment
   * Increment cigarettes smoked for a date
   */
  fastify.put(
    '/api/logs/:deviceId/:date/increment',
    {
      schema: {
        description: 'Increment cigarettes smoked for a date',
        tags: ['logs'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
          },
          required: ['deviceId', 'date'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              date: { type: 'string' },
              cigarettesSmoked: { type: 'integer' },
              cigarettesGoal: { type: 'integer' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId, date } = request.params as { deviceId: string; date: string };
      app.logger.info({ deviceId, date }, 'Incrementing cigarettes smoked');

      // Get existing log or create new one
      let log = await app.db.query.smokingLogs.findFirst({
        where: and(eq(schema.smokingLogs.deviceId, deviceId), eq(schema.smokingLogs.date, date)),
      });

      if (!log) {
        // Get settings to get daily goal
        const settings = await app.db.query.userSettings.findFirst({
          where: eq(schema.userSettings.deviceId, deviceId),
        });

        const goal = settings?.dailyCigaretteGoal || 10;
        const logId = generateId();

        const [created] = await app.db
          .insert(schema.smokingLogs)
          .values({
            id: logId,
            deviceId,
            date,
            cigarettesSmoked: 1,
            cigarettesGoal: goal,
          })
          .returning();

        log = created;
        app.logger.info({ deviceId, date, logId }, 'Smoking log created with increment');
      } else {
        // Increment existing log
        const [updated] = await app.db
          .update(schema.smokingLogs)
          .set({
            cigarettesSmoked: log.cigarettesSmoked + 1,
          })
          .where(and(eq(schema.smokingLogs.deviceId, deviceId), eq(schema.smokingLogs.date, date)))
          .returning();

        log = updated;
        app.logger.info(
          { deviceId, date, newCount: log.cigarettesSmoked },
          'Cigarettes incremented'
        );
      }

      reply.code(200);
      return log;
    }
  );
}
