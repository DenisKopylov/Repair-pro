"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
// apps/backend/src/lib/db.ts
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
(0, app_1.initializeApp)({ credential: (0, app_1.applicationDefault)() }); // без databaseURL!
exports.db = (0, firestore_1.getFirestore)();
