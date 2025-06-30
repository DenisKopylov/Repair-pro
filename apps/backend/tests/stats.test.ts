import request from 'supertest';
import { createApp } from '../src/app';
import jwt from 'jsonwebtoken';

const getMock = jest.fn();
const collectionMock = jest.fn(() => ({ get: getMock }));

const app = createApp();
const ENDPOINT = '/api/stats';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const adminToken = jwt.sign({ _id: 'admin', role: 'ADMIN', name: 'Admin' }, JWT_SECRET);
const userToken = jwt.sign({ _id: 'u1', role: 'USER', name: 'User' }, JWT_SECRET);

jest.mock('../src/lib/db', () => ({ db: { collection: collectionMock } }));

describe('GET ' + ENDPOINT, () => {
  beforeEach(() => {
    getMock.mockReset();
    collectionMock.mockClear();
  });

  it('\u2705 200 | returns statistics for admin', async () => {
    const docs = [
      { data: () => ({ partType: 'A', repairPrice: 10, defectPrice: 5, workHours: 2, clientName: 'Partner' }) },
      { data: () => ({ partType: 'B', repairPrice: 20, defectPrice: 0, workHours: 0, clientName: 'Partner' }) },
    ];
    getMock.mockResolvedValue({ forEach: (cb: any) => docs.forEach(d => cb(d)) });

    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.partTypeCounts).toEqual({ A: 1, B: 1 });
    expect(res.body.totals).toEqual({ repairPrice: 30, defectPrice: 5, internalPrice: 2 });
    expect(res.body.partnerStats.Partner).toEqual({ count: 2, total: 30 });
  });

  it('\u274c 403 | user is not admin', async () => {
    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('\u274c 500 | on db error', async () => {
    getMock.mockRejectedValue(new Error('fail'));

    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });
});
