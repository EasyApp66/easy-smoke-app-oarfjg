import { createApplication } from "@specific-dev/framework";
import * as schema from './db/schema.js';

// Import route registration functions
import * as settingsRoutes from './routes/settings.js';
import * as logsRoutes from './routes/logs.js';
import * as alarmsRoutes from './routes/alarms.js';
import * as statsRoutes from './routes/stats.js';
import * as promoRoutes from './routes/promo.js';

// Create application with schema for full database type support
export const app = await createApplication(schema);

// Export App type for use in route files
export type App = typeof app;

// Register routes - add your route modules here
// IMPORTANT: Always use registration functions to avoid circular dependency issues
settingsRoutes.register(app, app.fastify);
logsRoutes.register(app, app.fastify);
alarmsRoutes.register(app, app.fastify);
statsRoutes.register(app, app.fastify);
promoRoutes.register(app, app.fastify);

await app.run();
app.logger.info('Application running');
