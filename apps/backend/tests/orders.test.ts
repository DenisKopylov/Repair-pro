import request from 'supertest';
import { createApp } from '../src/app';
import * as OrderModel from '../src/models/Order';
import jwt from 'jsonwebtoken';

jest.mock('../src/models/Order');

const app = createApp();
const ENDPOINT = '/api/orders';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const userToken = jwt.sign({ _id: 'u1', role: 'USER', name: 'User1' }, JWT_SECRET);
const adminToken = jwt.sign({ _id: 'admin', role: 'ADMIN', name: 'Admin' }, JWT_SECRET);

describe('Orders routes', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST ' + ENDPOINT, () => {
    it('\u2705 201 | creates order for authenticated user', async () => {
      (OrderModel.createOrder as jest.Mock).mockImplementation(async (data) => ({
        id: 'o1',
        ...data,
      }));

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

      const res = await request(app)
        .get(`${ENDPOINT}/o1`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
    });

    it('\u2705 200 | admin can read any order', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u2' });

      const res = await request(app)
        .get(`${ENDPOINT}/o1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('\u274c 403 | foreign user forbidden', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue({ id: 'o1', userId: 'u2' });

      const res = await request(app)
        .get(`${ENDPOINT}/o1`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('\u274c 404 | not found', async () => {
      (OrderModel.getOrder as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get(`${ENDPOINT}/missing`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(404);
    });
  });
});
