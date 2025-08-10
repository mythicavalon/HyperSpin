const request = require('supertest');
jest.mock('../src/utils/firebaseAdmin', () => ({ verifyIdToken: jest.fn(async () => { throw new Error('not configured'); }) }));

const app = require('../src/app');

describe('Auth protection', () => {
  it('rejects without token', async () => {
    const res = await request(app).get('/api/leaderboard/me');
    expect(res.status).toBe(401);
  });
});