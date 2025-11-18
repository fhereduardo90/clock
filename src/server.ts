import express, { Request, Response } from 'express';
import { ConfigManager } from './ConfigManager';

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
      res.json(this.configManager.getMessages());
    });

    this.app.patch('/config', (req: Request, res: Response) => {
      const { tick, tock, bong } = req.body;
      const updates: { tick?: string; tock?: string; bong?: string } = {};

      if (tick !== undefined) updates.tick = tick;
      if (tock !== undefined) updates.tock = tock;
      if (bong !== undefined) updates.bong = bong;

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: 'No valid updates provided' });
        return;
      }

      this.configManager.updateMessages(updates);
      res.json({
        message: 'Configuration updated',
        config: this.configManager.getMessages(),
      });
    });

    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok' });
    });
  }

  public close(): void {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}
