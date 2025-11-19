import { ClockMessages, MessageKey } from './types';
import { DEFAULT_MESSAGES } from './constants';

/**
 * ConfigManager handles dynamic configuration of clock messages.
 * Allows runtime updates without restarting the application.
 */
export class ConfigManager {
  private messages: ClockMessages;

  constructor(initialMessages?: Partial<ClockMessages>) {
    this.messages = {
      ...DEFAULT_MESSAGES,
      ...initialMessages,
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

  public getMessage(key: MessageKey): string {
    return this.messages[key];
  }
}
