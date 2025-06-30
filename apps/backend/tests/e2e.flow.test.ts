process.env.JWT_SECRET = 'test-secret';

import request from 'supertest';
import bcrypt from 'bcrypt';

jest.mock('../src/models/User', () => {
  const users: any[] = [];
  return {
    __esModule: true,
    __users: users,
    __reset: () => { users.length = 0; },
    __seed: (u: any) => { users.push(u); },
    findUserByEmail: jest.fn(async (email: string) => {
      return users.find(u => u.email === email) || null;
    }),
    createUser: jest.fn(async (data: any) => {
      const user = { id: String(users.length + 1), ...data, createdAt: new Date() };
      users.push(user);
      return user;
    }),
  };
});

jest.mock('../src/models/Order', () => {
  const orders: any[] = [];
  return {
    __esModule: true,
    __orders: orders,
    __reset: () => { orders.length = 0; },
    createOrder: jest.fn(async (data: any) => {
      const order = { id: String(orders.length + 1), ...data, createdAt: new Date(), updatedAt: new Date() };
      orders.push(order);
      return order;
    }),
    getOrder: jest.fn(async (id: string) => orders.find(o => o.id === id) || null),
    updateOrder: jest.fn(async (id: string, data: any) => {
      const order = orders.find(o => o.id === id);
      if (!order) return null;
      Object.assign(order, data, { updatedAt: new Date() });
      return order;
    }),
    listOrders: jest.fn(async () => orders),
  };
});

import { createApp } from '../src/app';
import * as UserModel from '../src/models/User';
import * as OrderModel from '../src/models/Order';

const app = createApp();

beforeEach(() => {
  (UserModel as any).__reset();
  (OrderModel as any).__reset();

  (UserModel as any).__seed({
    id: 'admin-1',
    email: 'admin@test.com',
    passwordHash: bcrypt.hashSync('Admin123!', 10),
    name: 'Admin',
    role: 'ADMIN',
    createdAt: new Date(),
  });
});

describe('E2E flow', () => {
  it('register -> login -> create order -> admin confirm', async () => {
    // register new user
    let res = await request(app).post('/api/auth/register').send({
      email: 'user@test.com',
      password: 'User123!',
      name: 'Test User',
    });
    expect(res.status).toBe(201);

    // login user
    res = await request(app).post('/api/auth/login').send({
      email: 'user@test.com',
      password: 'User123!',
    });
    expect(res.status).toBe(200);
    const userToken = res.body.token;
    expect(userToken).toBeDefined();

    // create order
    res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ partType: 'wheel', description: 'broken', images: [] });
    expect(res.status).toBe(201);
    const orderId = res.body.id;
    expect(res.body.status).toBe('NEW');

    // login admin
    res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'Admin123!',
    });
    expect(res.status).toBe(200);
    const adminToken = res.body.token;

    // admin confirms (offers) order
    res = await request(app)
      .patch(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ defectPrice: 10, repairPrice: 20, workHours: 2 });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OFFERED');
  });
});