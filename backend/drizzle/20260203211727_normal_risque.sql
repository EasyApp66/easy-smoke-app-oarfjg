CREATE TABLE "scheduled_alarms" (
	"id" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"date" date NOT NULL,
	"alarm_times" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "smoking_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"date" date NOT NULL,
	"cigarettes_smoked" integer DEFAULT 0 NOT NULL,
	"cigarettes_goal" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"wake_time" text NOT NULL,
	"sleep_time" text NOT NULL,
	"daily_cigarette_goal" integer NOT NULL,
	"language" text DEFAULT 'de' NOT NULL,
	"background_color" text DEFAULT 'gray' NOT NULL,
	"premium_enabled" boolean DEFAULT false NOT NULL,
	"promo_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_settings_device_id_unique" UNIQUE("device_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "scheduled_alarms_device_date_idx" ON "scheduled_alarms" USING btree ("device_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "smoking_logs_device_date_idx" ON "smoking_logs" USING btree ("device_id","date");