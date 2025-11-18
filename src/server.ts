import express, { Request, Response } from 'express';
import { ConfigManager } from './ConfigManager';

/**
 * Validates that a value is a non-empty string within allowed length
 */
function isValidMessage(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 100 &&
    value.trim().length > 0
  );
}

export class Server {
  private app: express.Application;
  private configManager: ConfigManager;
  private server: ReturnType<typeof express.application.listen> | null = null;

  constructor(configManager: ConfigManager, port: number = 3000) {
    this.configManager = configManager;
    this.app = express();
    this.app.use(express.json());
    this.setupRoutes();
    this.server = this.app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  }

  private setupRoutes(): void {
    this.app.get('/config', (_req: Request, res: Response) => {
      try {
        res.json(this.configManager.getMessages());
      } catch (error) {
        res.status(500).json({
          error: 'Failed to retrieve configuration',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    this.app.patch('/config', (req: Request, res: Response) => {
      try {
        const { tick, tock, bong } = req.body;
        const updates: { tick?: string; tock?: string; bong?: string } = {};
        const errors: string[] = [];

        // Validate and collect updates
        if (tick !== undefined) {
          if (isValidMessage(tick)) {
            updates.tick = tick;
          } else {
            errors.push('tick must be a non-empty string (max 100 characters)');
          }
        }

        if (tock !== undefined) {
          if (isValidMessage(tock)) {
            updates.tock = tock;
          } else {
            errors.push('tock must be a non-empty string (max 100 characters)');
          }
        }

        if (bong !== undefined) {
          if (isValidMessage(bong)) {
            updates.bong = bong;
          } else {
            errors.push('bong must be a non-empty string (max 100 characters)');
          }
        }

        // Return validation errors if any
        if (errors.length > 0) {
          res.status(400).json({ error: 'Validation failed', errors });
          return;
        }

        // Check if any valid updates were provided
        if (Object.keys(updates).length === 0) {
          res.status(400).json({
            error: 'No valid updates provided',
            hint: 'Provide at least one of: tick, tock, bong',
          });
          return;
        }

        this.configManager.updateMessages(updates);
        res.json({
          message: 'Configuration updated',
          config: this.configManager.getMessages(),
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to update configuration',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });

    this.app.get('/health', (_req: Request, res: Response) => {
      try {
        res.json({ status: 'ok' });
      } catch (error) {
        res.status(500).json({
          error: 'Health check failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    });
  }

  public close(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
