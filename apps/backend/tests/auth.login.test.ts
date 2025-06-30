import request from 'supertest';
import { createApp } from '../src/app';
import * as UserModel from '../src/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

jest.mock('../src/models/User');

const app = createApp();
const ENDPOINT = '/api/auth/login';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

describe('POST ' + ENDPOINT, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('\u2705 200 | returns token for valid credentials', async () => {
    const password = 'Secret1!';
    const passwordHash = await bcrypt.hash(password, 10);
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue({
      id: 'uid-1',
      email: 'user@mail.com',
      passwordHash,
      role: 'USER',
      name: 'User One',
    });

    const res = await request(app).post(ENDPOINT).send({
      email: 'user@mail.com',
      password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    const payload = jwt.verify(res.body.token, JWT_SECRET) as any;
    expect(payload).toMatchObject({ _id: 'uid-1', role: 'USER', name: 'User One' });
  });

  it('\u274c 401 | user not found', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(ENDPOINT).send({
      email: 'missing@mail.com',
      password: 'pass',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('\u274c 401 | wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct', 10);
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue({
      id: 'uid-2',
      email: 'user@mail.com',
      passwordHash,
      role: 'USER',
      name: 'User Two',
    });

    const res = await request(app).post(ENDPOINT).send({
      email: 'user@mail.com',
      password: 'wrong',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
