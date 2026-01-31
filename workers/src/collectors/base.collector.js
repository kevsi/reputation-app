"use strict";
/**
 * 🏗️ Base Collector Interface & Factory
 *
 * Chaque plateforme (Twitter, Facebook, Trustpilot) implémente cette interface
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectorFactory = exports.BaseCollector = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
/**
 * Classe abstraite pour collectors
 */
class BaseCollector {
    axiosInstance = axios_1.default.create({
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
    });
    async validateCredentials(config) {
        try {
            const result = await this.testConnection(config);
            return result.success;
        }
        catch (error) {
            console.error('Credential validation failed:', error);
            return false;
        }
    }
    async fetchHtml(url) {
        const response = await this.axiosInstance.get(url);
        return response.data;
    }
    loadCheerio(html) {
        return cheerio.load(html);
    }
}
exports.BaseCollector = BaseCollector;
/**
 * Factory pour obtenir le bon collector
 */
class CollectorFactory {
    static collectors = new Map();
    static register(type, collectorClass) {
        this.collectors.set(type, collectorClass);
    }
    static getCollector(type) {
        this.ensureCollectorsRegistered();
        const CollectorClass = this.collectors.get(type);
        if (!CollectorClass) {
            throw new Error(`No collector registered for type: ${type}`);
        }
        return new CollectorClass();
    }
    static getAvailableCollectors() {
        this.ensureCollectorsRegistered();
        return Array.from(this.collectors.keys());
    }
    static ensureCollectorsRegistered() {
        if (this.collectors.size === 0) {
            // Lazy load collectors to avoid circular dependency
            try {
                const { TrustpilotCollector } = require('./trustpilot.collector');
                const { TwitterCollector } = require('./twitter.collector');
                this.register('TRUSTPILOT', TrustpilotCollector);
                this.register('TWITTER', TwitterCollector);
            }
            catch (error) {
                console.error('Failed to load collectors:', error);
            }
        }
    }
}
exports.CollectorFactory = CollectorFactory;
// Register collectors
// Moved to collectors/index.ts to avoid circular dependency
