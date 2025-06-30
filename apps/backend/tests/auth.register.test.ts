import request from 'supertest';
import { createApp } from '../src/app';
import * as UserModel from '../src/models/User';
import bcrypt from 'bcrypt';

const app = createApp();
const ENDPOINT = '/api/auth/register';

jest.mock('../src/models/User');

describe('POST ' + ENDPOINT, () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('\u2705 201 | \u0441\u043e\u0437\u0434\u0430\u0451\u0442 \u043d\u043e\u0432\u043e\u0433\u043e \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue(null);
    (UserModel.createUser as jest.Mock).mockImplementation(async data => ({
      id: 'uid-123',
      ...data,
    }));

    const payload = {
      email: 'new@email.com',
      password: 'Secret123!',
      name: '\u041d\u043e\u0432\u044b\u0439 \u041a\u043b\u0438\u0435\u043d\u0442',
    };

    const res = await request(app).post(ENDPOINT).send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });

    expect(UserModel.findUserByEmail).toHaveBeenCalledWith(payload.email);
    expect(UserModel.createUser).toHaveBeenCalledTimes(1);

    const saved = (UserModel.createUser as jest.Mock).mock.calls[0][0];
    expect(saved).toHaveProperty('passwordHash');
    expect(bcrypt.compareSync(payload.password, saved.passwordHash)).toBe(true);
  });

  it('\u274c 400 | \u043e\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u044e\u0442 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u044b\u0435 \u043f\u043e\u043b\u044f', async () => {
    const res = await request(app).post(ENDPOINT).send({ email: 'only@mail' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('\u274c 409 | e-mail \u0443\u0436\u0435 \u0437\u0430\u043d\u044f\u0442', async () => {
    (UserModel.findUserByEmail as jest.Mock).mockResolvedValue({ id: 'exists' });

    const res = await request(app).post(ENDPOINT).send({
      email: 'dup@mail.com',
      password: 'Dup123!',
      name: '\u0414\u0443\u0431\u043b\u0438\u043a\u0430\u0442',
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error', 'email already used');
  });
});
