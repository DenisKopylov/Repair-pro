"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apps/backend/src/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
require("./lib/db");
const app_1 = require("./app");
const PORT = Number(process.env.PORT) || 8080;
async function bootstrap() {
    const app = (0, app_1.createApp)();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`[backend] listening on port ${PORT}`);
    });
}
bootstrap().catch(err => {
    console.error('[backend] Failed to start', err);
    process.exit(1);
});
