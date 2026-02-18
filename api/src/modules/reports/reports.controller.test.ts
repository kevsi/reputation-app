import request from 'supertest';
import { createApp } from '../../app';

import { Application } from 'express';

describe('Reports API', () => {
  let app: Application;
  beforeAll(() => {
    app = createApp();
  });

  it('GET /api/reports doit retourner 200', async () => {
    const res = await request(app).get('/api/v1/reports');
    expect(res.status).toBe(200);
    // expect(res.body).toHaveProperty('data');
  });
});
