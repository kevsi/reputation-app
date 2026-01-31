"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMonitor = void 0;
const express_1 = __importDefault(require("express"));
const api_1 = require("@bull-board/api");
const bullAdapter_1 = require("@bull-board/api/bullAdapter");
const express_2 = require("@bull-board/express");
const queues_1 = require("./queues");
const setupMonitor = () => {
    const serverAdapter = new express_2.ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    (0, api_1.createBullBoard)({
        queues: [
            new bullAdapter_1.BullAdapter(queues_1.scrapingQueue),
            new bullAdapter_1.BullAdapter(queues_1.analysisQueue),
            new bullAdapter_1.BullAdapter(queues_1.notificationsQueue),
            new bullAdapter_1.BullAdapter(queues_1.reportsQueue),
        ],
        serverAdapter: serverAdapter,
    });
    const app = (0, express_1.default)();
    app.use('/admin/queues', serverAdapter.getRouter());
    const PORT = process.env.MONITOR_PORT || 3005;
    app.listen(PORT, () => {
        console.log(`📊 Worker Monitor available at http://localhost:${PORT}/admin/queues`);
    });
};
exports.setupMonitor = setupMonitor;
