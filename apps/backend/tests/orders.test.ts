import request from 'supertest';
import { createApp } from '../src/app';
import * as OrderModel from '../src/models/Order';
import { getAuth } from 'firebase-admin/auth';

const verifyMock = jest.fn();
jest.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: verifyMock })
}));

const app = createApp();
const ENDPOINT = '/api/orders';

const userToken = 'userToken';
const adminToken = 'adminToken';

jest.mock('../src/models/Order');

describe('Orders routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    verifyMock.mockReset();
  });

  describe('POST ' + ENDPOINT, () => {
    it('\u2705 201 | creates order for authenticated user', async () => {
      (OrderModel.createOrder as jest.Mock).mockImplementation(async (data) => ({
        id: 'o1',
        ...data,
      }));

      verifyMock.mockResolvedValueOnce({ uid: 'u1', role: 'USER', name: 'User1' });
      const payload = { partType: 'Wheel', description: 'desc', images: [] };
      const res = await request(app)
        .post(ENDPOINT)
        .set('Authorization', `Bearer ${userToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(OrderModel.createOrder).toHaveBeenCalledWith({
        userId: 'u1',
        clientName: 'User1',
        partType: 'Wheel',
        description: 'desc',
        images: [],
        status: 'NEW',
      });
    });

    it('\u274c 401 | no token', async () => {
      const res = await request(app).post(ENDPOINT).send({});
      expect(res.status).toBe(401);
    });
  });

  describe('GET ' + ENDPOINT + '/:id', () => {
    it('\u2705 200 | owner can read order', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u1' });

      verifyMock.mockResolvedValueOnce({ uid: 'u1', role: 'USER', name: 'User1' });
      const res = await request(app)
        .get(`${ENDPOINT}/o1`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });

    it('\u2705 200 | admin can read any order', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u2' });

      verifyMock.mockResolvedValueOnce({ uid: 'admin', role: 'ADMIN', name: 'Admin' });
      const res = await request(app)
        .get(`${ENDPOINT}/o1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('\u274c 403 | foreign user forbidden', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u2' });

      verifyMock.mockResolvedValueOnce({ uid: 'u1', role: 'USER', name: 'User1' });
      const res = await request(app)
        .get(`${ENDPOINT}/o1`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('\u274c 404 | not found', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue(null);

      verifyMock.mockResolvedValueOnce({ uid: 'u1', role: 'USER', name: 'User1' });
      const res = await request(app)
        .get(`${ENDPOINT}/missing`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
