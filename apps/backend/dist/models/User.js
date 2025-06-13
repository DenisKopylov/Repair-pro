"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserByEmail = findUserByEmail;
exports.createUser = createUser;
// apps/backend/src/models/User.ts
const db_1 = require("../lib/db");
const collection = db_1.db.collection('users');
async function findUserByEmail(email) {
    const snap = await collection.where('email', '==', email).limit(1).get();
    if (snap.empty)
        return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
}
async function createUser(data) {
    const docRef = await collection.add({ ...data, createdAt: new Date() });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
}
