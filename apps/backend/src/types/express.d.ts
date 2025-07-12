// src/types/express.d.ts
import 'express';

declare module 'express' {
  interface Request {
    user: {
      uid: string;
      email: string;
      name?: string;
      role?: string;
    };
  }
}

export {}; // Ensure this file is treated as a module
