export interface ClockMessages {
  tick: string;
  tock: string;
  bong: string;
}

export class ConfigManager {
  private messages: ClockMessages;

  constructor(initialMessages?: Partial<ClockMessages>) {
    this.messages = {
      tick: initialMessages?.tick || 'tick',
      tock: initialMessages?.tock || 'tock',
      bong: initialMessages?.bong || 'bong',
    };
  }

  public getMessages(): ClockMessages {
    return { ...this.messages };
  }

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
