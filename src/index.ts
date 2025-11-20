import 'dotenv/config';
import { ConfigManager } from './ConfigManager';
import { ClockEngine } from './ClockEngine';
import { Server } from './server';
import {
  DEFAULT_PORT,
  DEFAULT_SHUTDOWN_HOURS,
  MILLISECONDS_PER_HOUR,
} from './constants';
import { logger } from './logger';

// Configuration from environment variables with fallback to constants
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
const SHUTDOWN_TIME_HOURS = parseInt(
  process.env.SHUTDOWN_TIME_HOURS || String(DEFAULT_SHUTDOWN_HOURS),
  10
);
const SHUTDOWN_TIME_MS = SHUTDOWN_TIME_HOURS * MILLISECONDS_PER_HOUR;

function main() {
  logger.info('Starting Clock Application...');
  logger.info(
    `The application will run for ${SHUTDOWN_TIME_HOURS} hours and then exit.`
  );
  logger.info('Use the API to update messages:');
  logger.info(`  GET  http://localhost:${PORT}/config - View current config`);
  logger.info(
    `  PATCH http://localhost:${PORT}/config - Update messages (e.g., {"tick": "quack"})`
  );
  logger.info('');

  // Initialize components
  const configManager = new ConfigManager();
  const clockEngine = new ClockEngine(configManager);
  const server = new Server(configManager, PORT);

  // Start the clock
  clockEngine.start();

  // Set up shutdown timer
  const shutdownTimer = setTimeout(() => {
    logger.info('');
    logger.info(`${SHUTDOWN_TIME_HOURS} hours elapsed. Shutting down...`);
    shutdown();
  }, SHUTDOWN_TIME_MS);

  // Handle graceful shutdown
  const shutdown = () => {
    clearTimeout(shutdownTimer);
    clockEngine.stop();
    server.close();
    logger.info('Clock application stopped.');
    process.exit(0);
  };

  // Handle process termination signals
  process.on('SIGINT', () => {
    logger.info('');
    logger.info('Received SIGINT. Shutting down gracefully...');
    shutdown();
  });

  process.on('SIGTERM', () => {
    logger.info('');
    logger.info('Received SIGTERM. Shutting down gracefully...');
    shutdown();
  });
}

main();
