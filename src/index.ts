import 'dotenv/config';
import { ConfigManager } from './ConfigManager';
import { ClockEngine } from './ClockEngine';
import { Server } from './server';
import {
  DEFAULT_PORT,
  DEFAULT_SHUTDOWN_HOURS,
  MILLISECONDS_PER_HOUR,
} from './constants';

// Configuration from environment variables with fallback to constants
const PORT = parseInt(process.env.PORT || String(DEFAULT_PORT), 10);
const SHUTDOWN_TIME_HOURS = parseInt(
  process.env.SHUTDOWN_TIME_HOURS || String(DEFAULT_SHUTDOWN_HOURS),
  10
);
const SHUTDOWN_TIME_MS = SHUTDOWN_TIME_HOURS * MILLISECONDS_PER_HOUR;

function main() {
  console.log('Starting Clock Application...');
  console.log(`The application will run for ${SHUTDOWN_TIME_HOURS} hours and then exit.`);
  console.log('Use the API to update messages:');
  console.log(`  GET  http://localhost:${PORT}/config - View current config`);
  console.log(
    `  PATCH http://localhost:${PORT}/config - Update messages (e.g., {"tick": "quack"})`
  );
  console.log('');

  // Initialize components
  const configManager = new ConfigManager();
  const clockEngine = new ClockEngine(configManager);
  const server = new Server(configManager, PORT);

  // Start the clock
  clockEngine.start();

  // Set up shutdown timer
  const shutdownTimer = setTimeout(() => {
    console.log('');
    console.log(`${SHUTDOWN_TIME_HOURS} hours elapsed. Shutting down...`);
    shutdown();
  }, SHUTDOWN_TIME_MS);

  // Handle graceful shutdown
  const shutdown = () => {
    clearTimeout(shutdownTimer);
    clockEngine.stop();
    server.close();
    console.log('Clock application stopped.');
    process.exit(0);
  };

  // Handle process termination signals
  process.on('SIGINT', () => {
    console.log('');
    console.log('Received SIGINT. Shutting down gracefully...');
    shutdown();
  });

  process.on('SIGTERM', () => {
    console.log('');
    console.log('Received SIGTERM. Shutting down gracefully...');
    shutdown();
  });
}

main();
