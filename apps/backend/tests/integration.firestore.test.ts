process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'demo-test';

// Integration tests with the Firestore emulator can take longer
jest.setTimeout(20_000);

import request from 'supertest';
import { getFirestore } from 'firebase-admin/firestore';
import { createApp } from '../src/app';

const app = createApp();
const db = getFirestore();

async function clearCollection(name: string) {
  const docs = await db.collection(name).listDocuments();
  for (const d of docs) await d.delete();
}

beforeEach(async () => {
  await clearCollection('users');
  await clearCollection('orders');
});

describe('Integration with Firestore emulator', () => {
  it('registers, logs in and creates an order', async () => {
    const user = { email: 'test@example.com', password: 'Pass123!', name: 'Tester' };

    const reg = await request(app).post('/api/auth/register').send(user);
    expect(reg.status).toBe(201);

    const login = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    expect(login.status).toBe(200);
    const token = login.body.token;
    expect(token).toBeDefined();

    const orderPayload = { partType: 'engine', description: 'broken', images: [] };
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(orderPayload);
    expect(orderRes.status).toBe(201);
    const created = orderRes.body;

    const doc = await db.collection('orders').doc(created.id).get();
    expect(doc.exists).toBe(true);
    expect(doc.data()?.partType).toBe(orderPayload.partType);
  });
});

afterAll(async () => {
  await (app as any).close?.();
  await db.terminate();
});