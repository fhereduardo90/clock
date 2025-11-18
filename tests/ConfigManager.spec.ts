import { ConfigManager } from '../src/ConfigManager';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  describe('constructor', () => {
    it('should initialize with default messages', () => {
      const messages = configManager.getMessages();
      expect(messages).toEqual({
        tick: 'tick',
        tock: 'tock',
        bong: 'bong',
      });
    });

    it('should initialize with custom messages', () => {
      const customConfig = new ConfigManager({
        tick: 'custom-tick',
        tock: 'custom-tock',
      });
      const messages = customConfig.getMessages();
      expect(messages).toEqual({
        tick: 'custom-tick',
        tock: 'custom-tock',
        bong: 'bong',
      });
    });
  });

  describe('getMessages', () => {
    it('should return a copy of messages', () => {
      const messages1 = configManager.getMessages();
      const messages2 = configManager.getMessages();
      expect(messages1).toEqual(messages2);
      expect(messages1).not.toBe(messages2);
    });
  });

  describe('getMessage', () => {
    it('should return specific message by key', () => {
      expect(configManager.getMessage('tick')).toBe('tick');
      expect(configManager.getMessage('tock')).toBe('tock');
      expect(configManager.getMessage('bong')).toBe('bong');
    });
  });

  describe('updateMessages', () => {
    it('should update a single message', () => {
      configManager.updateMessages({ tick: 'quack' });
      expect(configManager.getMessage('tick')).toBe('quack');
      expect(configManager.getMessage('tock')).toBe('tock');
      expect(configManager.getMessage('bong')).toBe('bong');
    });

    it('should update multiple messages', () => {
      configManager.updateMessages({
        tick: 'beep',
        bong: 'boom',
      });
      expect(configManager.getMessage('tick')).toBe('beep');
      expect(configManager.getMessage('tock')).toBe('tock');
      expect(configManager.getMessage('bong')).toBe('boom');
    });

    it('should update all messages', () => {
      configManager.updateMessages({
        tick: 'one',
        tock: 'two',
        bong: 'three',
      });
      expect(configManager.getMessages()).toEqual({
        tick: 'one',
        tock: 'two',
        bong: 'three',
      });
    });
  });
});
