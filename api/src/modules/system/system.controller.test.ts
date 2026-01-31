import request from 'supertest';
import { createApp } from '../../app';

import { Application } from 'express';

describe('System API', () => {
  let app: Application;
  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/system/status doit retourner 200', async () => {
    const res = await request(app).get('/api/v1/system/status');
    expect(res.status).toBe(200);
    // expect(res.body).toHaveProperty('status');
  });
});
