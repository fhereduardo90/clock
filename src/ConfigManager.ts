export interface ClockMessages {
  tick: string;
  tock: string;
  bong: string;
}

/**
 * ConfigManager handles dynamic configuration of clock messages.
 * Allows runtime updates without restarting the application.
 */
export class ConfigManager {
  private messages: ClockMessages;

  constructor(initialMessages?: Partial<ClockMessages>) {
    this.messages = {
      tick: initialMessages?.tick || 'tick',
      tock: initialMessages?.tock || 'tock',
      bong: initialMessages?.bong || 'bong',
    };
  }

  /**
   * Returns a copy of current messages to prevent external mutation
   */
  public getMessages(): ClockMessages {
    return { ...this.messages };
  }

  /**
   * Updates one or more clock messages
   * @param newMessages - Partial updates to apply
   */
  public updateMessages(newMessages: Partial<ClockMessages>): void {
    this.messages = {
      ...this.messages,
      ...newMessages,
    };
  }

  public getMessage(key: keyof ClockMessages): string {
    return this.messages[key];
  }
}
