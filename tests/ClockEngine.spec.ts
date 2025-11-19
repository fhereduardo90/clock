import { ClockEngine } from '../src/ClockEngine';
import { ConfigManager } from '../src/ConfigManager';

describe('ClockEngine', () => {
  let configManager: ConfigManager;
  let clockEngine: ClockEngine;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    configManager = new ConfigManager();
    clockEngine = new ClockEngine(configManager);
  });

  afterEach(() => {
    clockEngine.stop();
    consoleLogSpy.mockRestore();
    jest.useRealTimers();
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

  describe('timing behavior', () => {
    it('should print tick every second', () => {
      // Set time to 12:30:15
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 15));

      clockEngine.start();

      // Advance 100ms to trigger first tick
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      // Move to next second (12:30:16)
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 16));
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);

      // Move to next second (12:30:17)
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 17));
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');
      expect(consoleLogSpy).toHaveBeenCalledTimes(3);
    });

    it('should print tock at the start of every minute (second 0)', () => {
      // Set time to 12:30:59
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 59));

      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');

      consoleLogSpy.mockClear();

      // Move to 12:31:00 (minute boundary)
      jest.setSystemTime(new Date(2024, 0, 1, 12, 31, 0));
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('tock');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should print bong at the start of every hour (minute 0, second 0)', () => {
      // Set time to 12:59:59
      jest.setSystemTime(new Date(2024, 0, 1, 12, 59, 59));

      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');

      consoleLogSpy.mockClear();

      // Move to 13:00:00 (hour boundary)
      jest.setSystemTime(new Date(2024, 0, 1, 13, 0, 0));
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('bong');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should only print one message per second (priority: bong > tock > tick)', () => {
      // Test at hour boundary: should print bong, not tock or tick
      jest.setSystemTime(new Date(2024, 0, 1, 13, 0, 0));
      clockEngine.start();
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('bong');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalledWith('tock');
      expect(consoleLogSpy).not.toHaveBeenCalledWith('tick');

      clockEngine.stop();
      consoleLogSpy.mockClear();

      // Test at minute boundary (not hour): should print tock, not tick
      jest.setSystemTime(new Date(2024, 0, 1, 13, 15, 0));
      clockEngine.start();
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('tock');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).not.toHaveBeenCalledWith('tick');
    });

    it('should not print multiple times within the same second', () => {
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 15));

      clockEngine.start();

      // First 100ms tick
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      // Same second, multiple 100ms intervals
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(100);

      // Should still only have been called once
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should use messages from ConfigManager', () => {
      configManager.updateMessages({ tick: 'quack', tock: 'ding', bong: 'dong' });

      // Test tick
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 15));
      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('quack');

      clockEngine.stop();
      consoleLogSpy.mockClear();

      // Test tock
      jest.setSystemTime(new Date(2024, 0, 1, 12, 31, 0));
      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('ding');

      clockEngine.stop();
      consoleLogSpy.mockClear();

      // Test bong
      jest.setSystemTime(new Date(2024, 0, 1, 13, 0, 0));
      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('dong');
    });

    it('should update messages dynamically when ConfigManager changes', () => {
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 15));

      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');

      // Update message
      configManager.updateMessages({ tick: 'beep' });

      consoleLogSpy.mockClear();

      // Move to next second
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 16));
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('beep');
    });

    it('should reset lastSecond when stopped', () => {
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 15));

      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      clockEngine.stop();
      consoleLogSpy.mockClear();

      // Start again at the same second
      clockEngine.start();
      jest.advanceTimersByTime(100);

      // Should print again because lastSecond was reset
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle midnight boundary correctly (00:00:00)', () => {
      jest.setSystemTime(new Date(2024, 0, 1, 23, 59, 59));

      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');

      consoleLogSpy.mockClear();

      // Move to midnight (00:00:00 - hour boundary)
      jest.setSystemTime(new Date(2024, 0, 2, 0, 0, 0));
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('bong');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle second 59 -> second 0 transition correctly', () => {
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 59));

      clockEngine.start();
      jest.advanceTimersByTime(100);
      expect(consoleLogSpy).toHaveBeenCalledWith('tick');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);

      consoleLogSpy.mockClear();

      // Move from second 59 to second 0
      jest.setSystemTime(new Date(2024, 0, 1, 12, 31, 0));
      jest.advanceTimersByTime(100);

      expect(consoleLogSpy).toHaveBeenCalledWith('tock');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('interval cleanup', () => {
    it('should clear interval when stopped', () => {
      clockEngine.start();
      expect(clockEngine.getStatus()).toBe(true);

      clockEngine.stop();

      // Advance time and verify no logs
      jest.advanceTimersByTime(1000);
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should not create multiple intervals on multiple starts', () => {
      jest.setSystemTime(new Date(2024, 0, 1, 12, 30, 15));

      clockEngine.start();
      clockEngine.start(); // Try to start again
      clockEngine.start(); // And again

      jest.advanceTimersByTime(100);

      // Should only print once
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });
});
