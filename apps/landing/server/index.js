"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const demo_1 = require("./routes/demo");
function createServer() {
    const app = (0, express_1.default)();
    // Middleware
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // Example API routes
    app.get("/api/ping", (_req, res) => {
        const ping = process.env.PING_MESSAGE ?? "ping";
        res.json({ message: ping });
    });
    app.get("/api/demo", demo_1.handleDemo);
    return app;
}
