// Declare mocks using var so they are available for the mock factory
var getMock: jest.Mock;
var collectionMock: jest.Mock;

// Mock the database module before importing the app
jest.mock('../src/lib/db', () => {
  getMock = jest.fn();
  collectionMock = jest.fn(() => ({ get: getMock }));
  return { db: { collection: collectionMock } };
});

import request from 'supertest';
import { createApp } from '../src/app';
const verifyMock = jest.fn();
jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: verifyMock })
}));

const app = createApp();
const ENDPOINT = '/api/stats';
const adminToken = 'adminToken';
const userToken = 'userToken';

describe('GET ' + ENDPOINT, () => {
  beforeEach(() => {
    getMock.mockReset();
    collectionMock.mockClear();
    verifyMock.mockReset();
  });

  it('\u2705 200 | returns statistics for admin', async () => {
    const docs = [
      { data: () => ({ partType: 'A', repairPrice: 10, defectPrice: 5, workHours: 2, clientName: 'Partner' }) },
      { data: () => ({ partType: 'B', repairPrice: 20, defectPrice: 0, workHours: 0, clientName: 'Partner' }) },
    ];
    getMock.mockResolvedValue({ forEach: (cb: any) => docs.forEach(d => cb(d)) });

    verifyMock.mockResolvedValueOnce({ uid: 'admin', role: 'ADMIN', name: 'Admin' });
    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.partTypeCounts).toEqual({ A: 1, B: 1 });
    expect(res.body.totals).toEqual({ repairPrice: 30, defectPrice: 5, internalPrice: 2 });
    expect(res.body.partnerStats.Partner).toEqual({ count: 2, total: 30 });
  });

  it('\u274c 403 | user is not admin', async () => {
    verifyMock.mockResolvedValueOnce({ uid: 'u1', role: 'USER', name: 'User' });
    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('\u274c 500 | on db error', async () => {
    getMock.mockRejectedValue(new Error('fail'));

    verifyMock.mockResolvedValueOnce({ uid: 'admin', role: 'ADMIN', name: 'Admin' });
    const res = await request(app)
      .get(ENDPOINT)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
  });
});
