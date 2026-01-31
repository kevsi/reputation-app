"use strict";
/**
 * Collectors Index
 *
 * Central exports for collectors
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterCollector = exports.TrustpilotCollector = exports.CollectorFactory = void 0;
var base_collector_1 = require("./base.collector");
Object.defineProperty(exports, "CollectorFactory", { enumerable: true, get: function () { return base_collector_1.CollectorFactory; } });
var trustpilot_collector_1 = require("./trustpilot.collector");
Object.defineProperty(exports, "TrustpilotCollector", { enumerable: true, get: function () { return trustpilot_collector_1.TrustpilotCollector; } });
var twitter_collector_1 = require("./twitter.collector");
Object.defineProperty(exports, "TwitterCollector", { enumerable: true, get: function () { return twitter_collector_1.TwitterCollector; } });
