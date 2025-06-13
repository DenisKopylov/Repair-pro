"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/backend/src/server.ts
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
require("./lib/db");
dotenv_1.default.config();
const PORT = Number(process.env.PORT) || 8080;
async function bootstrap() {
    try {
        const app = (0, app_1.createApp)();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[backend] listening on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('[backend] Failed to start', err);
        process.exit(1);
    }
}
bootstrap();
