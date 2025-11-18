import { ConfigManager } from './ConfigManager';

export class ClockEngine {
  private configManager: ConfigManager;
  private secondInterval: NodeJS.Timeout | null = null;
  private minuteInterval: NodeJS.Timeout | null = null;
  private hourInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start intervals aligned to system clock
    this.startSecondInterval();
    this.startMinuteInterval();
    this.startHourInterval();
  }

  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.secondInterval) {
      clearInterval(this.secondInterval);
      this.secondInterval = null;
    }

    if (this.minuteInterval) {
      clearInterval(this.minuteInterval);
      this.minuteInterval = null;
    }

    if (this.hourInterval) {
      clearInterval(this.hourInterval);
      this.hourInterval = null;
    }
  }

  private startSecondInterval(): void {
    this.secondInterval = setInterval(() => {
      this.printIfAllowed('tick');
    }, 1000);
  }

  private startMinuteInterval(): void {
    this.minuteInterval = setInterval(() => {
      this.printIfAllowed('tock');
    }, 60000);
  }

  private startHourInterval(): void {
    this.hourInterval = setInterval(() => {
      this.printIfAllowed('bong');
    }, 3600000);
  }

  private printIfAllowed(messageType: 'tick' | 'tock' | 'bong'): void {
    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();

    // Priority: bong > tock > tick
    // Only print if no higher priority message should be printed
    if (messageType === 'tick') {
      // Don't print tick on the minute or hour
      if (seconds === 0) {
        return;
      }
    } else if (messageType === 'tock') {
      // Don't print tock on the hour
      if (minutes === 0 && seconds === 0) {
        return;
      }
    }

    const message = this.configManager.getMessage(messageType);
    console.log(message);
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}
