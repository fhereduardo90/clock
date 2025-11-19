import express, { Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import { ConfigManager } from './ConfigManager';
import { DEFAULT_PORT } from './constants';
import { ConfigUpdateSchema } from './schemas';

export class Server {
  private app: express.Application;
  private configManager: ConfigManager;
  private server: HttpServer | null = null;

  constructor(configManager: ConfigManager, port: number = DEFAULT_PORT) {
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
        // Validate request body with Zod
        const result = ConfigUpdateSchema.safeParse(req.body);

        if (!result.success) {
          // Format Zod validation errors with consistent message
          const errors = result.error.issues.map((issue) => {
            const field = issue.path.join('.');
            return `${field} must be a non-empty string (max 100 characters)`;
          });

          res.status(400).json({ error: 'Validation failed', errors });
          return;
        }

        const updates = result.data;

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

  /**
   * Returns the Express application instance for testing purposes
   */
  public getApp(): express.Application {
    return this.app;
  }
}
