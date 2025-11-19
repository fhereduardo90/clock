import { ConfigManager } from './ConfigManager';
import { CLOCK_TICK_INTERVAL_MS } from './constants';

/**
 * ClockEngine manages the clock's timing mechanism.
 * Uses a single interval checking approach to ensure precise timing
 * and prevent race conditions between multiple intervals.
 */
export class ClockEngine {
  private configManager: ConfigManager;
  private mainInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  /**
   * Tracks the last second processed to prevent duplicate prints
   * within the same second. Initialized to -1 to ensure first second triggers.
   */
  private lastSecond = -1;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    /**
     * Check time at regular intervals for precision instead of using separate
     * 1s/60s/3600s intervals. This prevents race conditions and ensures
     * only one message prints per second based on priority system.
     */
    this.mainInterval = setInterval(() => {
      this.tick();
    }, CLOCK_TICK_INTERVAL_MS);
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.mainInterval) {
      clearInterval(this.mainInterval);
      this.mainInterval = null;
    }

    this.lastSecond = -1;
  }

  /**
   * Determines what message to print based on current time.
   * Priority system ensures only one message per second:
   * - Hour (minute=0, second=0): bong
   * - Minute (second=0): tock
   * - All other seconds: tick
   */
  private tick(): void {
    const now = new Date();
    const currentSecond = now.getSeconds();

    // Only process once per second
    if (currentSecond === this.lastSecond) {
      return;
    }

    this.lastSecond = currentSecond;

    const minutes = now.getMinutes();

    // Priority: bong > tock > tick
    if (minutes === 0 && currentSecond === 0) {
      // Hour boundary - print bong
      const message = this.configManager.getMessage('bong');
      console.log(message);
    } else if (currentSecond === 0) {
      // Minute boundary - print tock
      const message = this.configManager.getMessage('tock');
      console.log(message);
    } else {
      // Every other second - print tick
      const message = this.configManager.getMessage('tick');
      console.log(message);
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}
