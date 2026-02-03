import { pgTable, text, timestamp, boolean, integer, jsonb, date, uniqueIndex } from 'drizzle-orm/pg-core';

/**
 * User Settings Table
 * Stores user settings and preferences (anonymous per device)
 */
export const userSettings = pgTable('user_settings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  wakeTime: text('wake_time').notNull(), // HH:MM format
  sleepTime: text('sleep_time').notNull(), // HH:MM format
  dailyCigaretteGoal: integer('daily_cigarette_goal').notNull(),
  language: text('language').notNull().default('de'), // 'de' or 'en'
  backgroundColor: text('background_color').notNull().default('gray'), // 'gray' or 'black'
  premiumEnabled: boolean('premium_enabled').notNull().default(false),
  promoCode: text('promo_code'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/**
 * Smoking Logs Table
 * Tracks daily smoking statistics
 */
export const smokingLogs = pgTable('smoking_logs', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  date: date('date').notNull(), // YYYY-MM-DD format
  cigarettesSmoked: integer('cigarettes_smoked').notNull().default(0),
  cigarettesGoal: integer('cigarettes_goal').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex('smoking_logs_device_date_idx').on(table.deviceId, table.date),
]);

/**
 * Scheduled Alarms Table
 * Stores scheduled alarm times for each day
 */
export const scheduledAlarms = pgTable('scheduled_alarms', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  date: date('date').notNull(), // YYYY-MM-DD format
  alarmTimes: jsonb('alarm_times').notNull().$type<string[]>(), // Array of HH:MM times
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('scheduled_alarms_device_date_idx').on(table.deviceId, table.date),
]);
