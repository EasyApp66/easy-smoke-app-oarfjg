import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';
import { generateId } from '../utils/id.js';

export function register(app: App, fastify: FastifyInstance) {
  /**
   * GET /api/alarms/:deviceId/:date
   * Get scheduled alarm times for a specific date
   */
  fastify.get(
    '/api/alarms/:deviceId/:date',
    {
      schema: {
        description: 'Get scheduled alarm times for a specific date',
        tags: ['alarms'],
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
              alarmTimes: {
                type: 'array',
                items: { type: 'string' },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId, date } = request.params as { deviceId: string; date: string };
      app.logger.info({ deviceId, date }, 'Fetching scheduled alarms');

      const alarm = await app.db.query.scheduledAlarms.findFirst({
        where: and(eq(schema.scheduledAlarms.deviceId, deviceId), eq(schema.scheduledAlarms.date, date)),
      });

      if (alarm) {
        app.logger.info({ deviceId, date, count: alarm.alarmTimes.length }, 'Alarms retrieved');
        return { alarmTimes: alarm.alarmTimes };
      }

      app.logger.info({ deviceId, date }, 'No alarms found, returning empty array');
      return { alarmTimes: [] };
    }
  );

  /**
   * POST /api/alarms
   * Save alarm times for a date
   */
  fastify.post(
    '/api/alarms',
    {
      schema: {
        description: 'Save alarm times for a date',
        tags: ['alarms'],
        body: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
            date: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
            alarmTimes: {
              type: 'array',
              items: { type: 'string', pattern: '^\\d{2}:\\d{2}$' },
            },
          },
          required: ['deviceId', 'date', 'alarmTimes'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              deviceId: { type: 'string' },
              date: { type: 'string' },
              alarmTimes: {
                type: 'array',
                items: { type: 'string' },
              },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId, date, alarmTimes } = request.body as {
        deviceId: string;
        date: string;
        alarmTimes: string[];
      };

      app.logger.info(
        { deviceId, date, alarmCount: alarmTimes.length },
        'Saving alarm times'
      );

      // Check if alarm already exists
      const existingAlarm = await app.db.query.scheduledAlarms.findFirst({
        where: and(
          eq(schema.scheduledAlarms.deviceId, deviceId),
          eq(schema.scheduledAlarms.date, date)
        ),
      });

      let alarm;

      if (existingAlarm) {
        // Update existing alarm
        const [updated] = await app.db
          .update(schema.scheduledAlarms)
          .set({
            alarmTimes,
          })
          .where(
            and(
              eq(schema.scheduledAlarms.deviceId, deviceId),
              eq(schema.scheduledAlarms.date, date)
            )
          )
          .returning();

        alarm = updated;
        app.logger.info(
          { deviceId, date, alarmId: alarm.id },
          'Alarms updated'
        );
      } else {
        // Create new alarm
        const alarmId = generateId();
        const [created] = await app.db
          .insert(schema.scheduledAlarms)
          .values({
            id: alarmId,
            deviceId,
            date,
            alarmTimes,
          })
          .returning();

        alarm = created;
        app.logger.info(
          { deviceId, date, alarmId },
          'Alarms created'
        );
      }

      reply.code(200);
      return alarm;
    }
  );
}
