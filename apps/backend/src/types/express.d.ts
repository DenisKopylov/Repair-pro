// src/types/express.d.ts
import "express";                 // чтобы подтянуть исходные типы

declare global {
  namespace Express {
    /** Полная форма данных, которые кладёт auth-middleware */
    interface UserPayload {
      uid:   string;
      name:  string;
      role:  string;
      email?: string;             // ⚠️ делаем опциональным!
      // любые другие поля из Firebase-токена:
      [key: string]: unknown;
    }

    interface Request {
      /** Заполняется в auth-middleware */
      user?: UserPayload;
    }
  }
}