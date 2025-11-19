import request from 'supertest';
import express from 'express';
import { Server } from '../src/server';
import { ConfigManager } from '../src/ConfigManager';

describe('Server HTTP Endpoints', () => {
  let server: Server;
  let configManager: ConfigManager;
  let app: express.Application;

  beforeEach(() => {
    configManager = new ConfigManager();
    server = new Server(configManager, 3001);
    app = server.getApp();
  });

  afterEach(() => {
    server.close();
  });

  describe('GET /config', () => {
    it('should return default configuration', async () => {
      const response = await request(app).get('/config').expect(200);

      expect(response.body).toEqual({
        tick: 'tick',
        tock: 'tock',
        bong: 'bong',
      });
    });

    it('should return updated configuration', async () => {
      configManager.updateMessages({ tick: 'quack' });

      const response = await request(app).get('/config').expect(200);

      expect(response.body).toEqual({
        tick: 'quack',
        tock: 'tock',
        bong: 'bong',
      });
    });

    it('should return JSON content-type', async () => {
      const response = await request(app).get('/config').expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('PATCH /config', () => {
    describe('successful updates', () => {
      it('should update tick message', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: 'quack' })
          .expect(200);

        expect(response.body.message).toBe('Configuration updated');
        expect(response.body.config.tick).toBe('quack');
        expect(configManager.getMessages().tick).toBe('quack');
      });

      it('should update tock message', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tock: 'ding' })
          .expect(200);

        expect(response.body.config.tock).toBe('ding');
        expect(configManager.getMessages().tock).toBe('ding');
      });

      it('should update bong message', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ bong: 'dong' })
          .expect(200);

        expect(response.body.config.bong).toBe('dong');
        expect(configManager.getMessages().bong).toBe('dong');
      });

      it('should update multiple messages at once', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: 'beep', tock: 'boop', bong: 'buzz' })
          .expect(200);

        expect(response.body.config).toEqual({
          tick: 'beep',
          tock: 'boop',
          bong: 'buzz',
        });
      });

      it('should accept messages up to 100 characters', async () => {
        const longMessage = 'a'.repeat(100);
        const response = await request(app)
          .patch('/config')
          .send({ tick: longMessage })
          .expect(200);

        expect(response.body.config.tick).toBe(longMessage);
      });

      it('should preserve unchanged messages', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: 'new-tick' })
          .expect(200);

        expect(response.body.config.tick).toBe('new-tick');
        expect(response.body.config.tock).toBe('tock');
        expect(response.body.config.bong).toBe('bong');
      });
    });

    describe('validation errors', () => {
      it('should reject empty string messages', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: '' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.errors).toContain(
          'tick must be a non-empty string (max 100 characters)'
        );
      });

      it('should reject whitespace-only messages', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: '   ' })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.errors).toContain(
          'tick must be a non-empty string (max 100 characters)'
        );
      });

      it('should reject non-string values (number)', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: 123 })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.errors).toContain(
          'tick must be a non-empty string (max 100 characters)'
        );
      });

      it('should reject non-string values (boolean)', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: true })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      });

      it('should reject non-string values (null)', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: null })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
      });

      it('should reject messages over 100 characters', async () => {
        const tooLong = 'a'.repeat(101);
        const response = await request(app)
          .patch('/config')
          .send({ tick: tooLong })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.errors).toContain(
          'tick must be a non-empty string (max 100 characters)'
        );
      });

      it('should accumulate multiple validation errors', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: '', tock: 123, bong: '   ' })
          .expect(400);

        expect(response.body.errors).toHaveLength(3);
        expect(response.body.errors).toContain(
          'tick must be a non-empty string (max 100 characters)'
        );
        expect(response.body.errors).toContain(
          'tock must be a non-empty string (max 100 characters)'
        );
        expect(response.body.errors).toContain(
          'bong must be a non-empty string (max 100 characters)'
        );
      });

      it('should reject request with no valid updates', async () => {
        const response = await request(app)
          .patch('/config')
          .send({})
          .expect(400);

        expect(response.body.error).toBe('No valid updates provided');
        expect(response.body.hint).toBe('Provide at least one of: tick, tock, bong');
      });

      it('should reject request with only invalid fields', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ invalid: 'field' })
          .expect(400);

        expect(response.body.error).toBe('No valid updates provided');
      });
    });

    describe('partial updates', () => {
      it('should apply valid updates and reject invalid ones', async () => {
        const response = await request(app)
          .patch('/config')
          .send({ tick: 'valid', tock: 123 })
          .expect(400);

        expect(response.body.error).toBe('Validation failed');
        expect(response.body.errors).toContain(
          'tock must be a non-empty string (max 100 characters)'
        );
        // Original tick value should remain unchanged
        expect(configManager.getMessages().tick).toBe('tick');
      });
    });

    it('should return JSON content-type', async () => {
      const response = await request(app)
        .patch('/config')
        .send({ tick: 'quack' })
        .expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });

  describe('GET /health', () => {
    it('should return ok status', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });

    it('should return JSON content-type', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
