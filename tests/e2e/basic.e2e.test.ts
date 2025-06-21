import request from 'supertest';
import app from '../../backend/src/app';

describe('E2E: unknown route', () => {
  it('returns 404 for unknown path', async () => {
    const res = await request(app).get('/unknown');
    expect(res.status).toBe(404);
  });
});
