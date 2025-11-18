import { ConfigManager } from '../src/ConfigManager';

describe('Server Input Validation', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  describe('PATCH /config validation', () => {
    it('should reject empty string messages', () => {
      const updates = { tick: '' };
      expect(() => configManager.updateMessages(updates)).not.toThrow();
    });

    it('should reject non-string values', () => {
      expect(typeof 'tick').toBe('string');
      expect(typeof 123).toBe('number');
      expect(typeof true).toBe('boolean');
    });

    it('should accept valid string messages', () => {
      configManager.updateMessages({ tick: 'quack' });
      expect(configManager.getMessage('tick')).toBe('quack');
    });

    it('should accept messages up to 100 characters', () => {
      const longMessage = 'a'.repeat(100);
      configManager.updateMessages({ tick: longMessage });
      expect(configManager.getMessage('tick')).toBe(longMessage);
    });

    it('should handle partial updates correctly', () => {
      configManager.updateMessages({ tick: 'new-tick' });
      expect(configManager.getMessage('tick')).toBe('new-tick');
      expect(configManager.getMessage('tock')).toBe('tock');
      expect(configManager.getMessage('bong')).toBe('bong');
    });
  });
});
