"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupQueue = exports.reportsQueue = exports.notificationsQueue = exports.analysisQueue = exports.mentionQueue = exports.scrapingQueue = void 0;
require("dotenv/config");
const bull_1 = __importDefault(require("bull"));
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
exports.scrapingQueue = new bull_1.default('scraping', REDIS_URL);
exports.mentionQueue = new bull_1.default('mention', REDIS_URL);
exports.analysisQueue = new bull_1.default('analysis', REDIS_URL);
exports.notificationsQueue = new bull_1.default('notifications', REDIS_URL);
exports.reportsQueue = new bull_1.default('reports', REDIS_URL);
exports.cleanupQueue = new bull_1.default('cleanup', REDIS_URL);
console.log(`📡 Bull Queues initialized with Redis: ${REDIS_URL}`);
