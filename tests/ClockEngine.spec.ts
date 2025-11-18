import { ClockEngine } from '../src/ClockEngine';
import { ConfigManager } from '../src/ConfigManager';

describe('ClockEngine', () => {
  let configManager: ConfigManager;
  let clockEngine: ClockEngine;

  beforeEach(() => {
    configManager = new ConfigManager();
    clockEngine = new ClockEngine(configManager);
  });

  afterEach(() => {
    clockEngine.stop();
  });

  describe('start and stop', () => {
    it('should start the clock engine', () => {
      clockEngine.start();
      expect(clockEngine.getStatus()).toBe(true);
    });

    it('should stop the clock engine', () => {
      clockEngine.start();
      clockEngine.stop();
      expect(clockEngine.getStatus()).toBe(false);
    });

    it('should not start twice', () => {
      clockEngine.start();
      clockEngine.start();
      expect(clockEngine.getStatus()).toBe(true);
    });

    it('should not stop if not running', () => {
      clockEngine.stop();
      expect(clockEngine.getStatus()).toBe(false);
    });
  });

  describe('getStatus', () => {
    it('should return false when not running', () => {
      expect(clockEngine.getStatus()).toBe(false);
    });

    it('should return true when running', () => {
      clockEngine.start();
      expect(clockEngine.getStatus()).toBe(true);
    });
  });
});
