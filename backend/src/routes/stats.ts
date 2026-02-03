import type { FastifyInstance } from 'fastify';
import { eq, desc, and, gte } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import type { App } from '../index.js';

export function register(app: App, fastify: FastifyInstance) {
  /**
   * GET /api/stats/:deviceId
   * Get statistics for the last 7 days
   */
  fastify.get(
    '/api/stats/:deviceId',
    {
      schema: {
        description: 'Get statistics for the last 7 days',
        tags: ['stats'],
        params: {
          type: 'object',
          properties: {
            deviceId: { type: 'string' },
          },
          required: ['deviceId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              totalSmoked: { type: 'integer' },
              averagePerDay: { type: 'number' },
              bestDay: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
              weeklyData: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    date: { type: 'string' },
                    smoked: { type: 'integer' },
                    goal: { type: 'integer' },
                  },
                },
              },
              trend: { type: 'string', enum: ['stable', 'improving', 'worsening'] },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { deviceId } = request.params as { deviceId: string };
      app.logger.info({ deviceId }, 'Fetching statistics');

      // Get last 7 days of logs
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoString = sevenDaysAgo.toISOString().split('T')[0];

      const logs = await app.db
        .select()
        .from(schema.smokingLogs)
        .where(
          and(
            eq(schema.smokingLogs.deviceId, deviceId),
            gte(schema.smokingLogs.date, sevenDaysAgoString)
          )
        )
        .orderBy(desc(schema.smokingLogs.date));

      app.logger.info({ deviceId, logCount: logs.length }, 'Logs retrieved for statistics');

      // Calculate statistics
      const totalSmoked = logs.reduce((sum, log) => sum + log.cigarettesSmoked, 0);
      const averagePerDay = logs.length > 0 ? totalSmoked / logs.length : 0;

      // Find best day (lowest smoking count)
      let bestDay = { date: '', count: 0 };
      if (logs.length > 0) {
        const sorted = [...logs].sort((a, b) => a.cigarettesSmoked - b.cigarettesSmoked);
        bestDay = { date: sorted[0].date, count: sorted[0].cigarettesSmoked };
      }

      // Calculate trend
      let trend: 'stable' | 'improving' | 'worsening' = 'stable';
      if (logs.length >= 2) {
        // Compare first half vs second half
        const midpoint = Math.floor(logs.length / 2);
        const firstHalf = logs.slice(0, midpoint);
        const secondHalf = logs.slice(midpoint);

        const avgFirstHalf = firstHalf.reduce((sum, l) => sum + l.cigarettesSmoked, 0) / firstHalf.length;
        const avgSecondHalf = secondHalf.reduce((sum, l) => sum + l.cigarettesSmoked, 0) / secondHalf.length;

        if (avgSecondHalf < avgFirstHalf) {
          trend = 'improving';
        } else if (avgSecondHalf > avgFirstHalf) {
          trend = 'worsening';
        } else {
          trend = 'stable';
        }
      }

      const stats = {
        totalSmoked,
        averagePerDay: Math.round(averagePerDay * 100) / 100,
        bestDay,
        weeklyData: logs.map((log) => ({
          date: log.date,
          smoked: log.cigarettesSmoked,
          goal: log.cigarettesGoal,
        })),
        trend,
      };

      app.logger.info(
        { deviceId, totalSmoked, averagePerDay: stats.averagePerDay, trend },
        'Statistics calculated'
      );

      return stats;
    }
  );
}
