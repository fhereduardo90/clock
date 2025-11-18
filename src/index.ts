import { ConfigManager } from './ConfigManager';
import { ClockEngine } from './ClockEngine';
import { Server } from './server';

const THREE_HOURS_IN_MS = 3 * 60 * 60 * 1000;

function main() {
  console.log('Starting Clock Application...');
  console.log('The application will run for 3 hours and then exit.');
  console.log('Use the API to update messages:');
  console.log('  GET  http://localhost:3000/config - View current config');
  console.log(
    '  PATCH http://localhost:3000/config - Update messages (e.g., {"tick": "quack"})'
  );
  console.log('');

  // Initialize components
  const configManager = new ConfigManager();
  const clockEngine = new ClockEngine(configManager);
  const server = new Server(configManager, 3000);

  // Start the clock
  clockEngine.start();

  // Set up 3-hour shutdown timer
  const shutdownTimer = setTimeout(() => {
    console.log('');
    console.log('3 hours elapsed. Shutting down...');
    shutdown();
  }, THREE_HOURS_IN_MS);

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
