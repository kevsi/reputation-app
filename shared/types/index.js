"use strict";
// ========================================
// SHARED TYPES - Utilisés par API et Frontend
// ========================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionTier = exports.ReportType = exports.ActionType = exports.AlertStatus = exports.AlertLevel = exports.Sentiment = exports.SourceType = exports.Role = void 0;
// ========================================
// ENUMS
// ========================================
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var SourceType;
(function (SourceType) {
    SourceType["REDDIT"] = "REDDIT";
    SourceType["TWITTER"] = "TWITTER";
    SourceType["DISCORD"] = "DISCORD";
    SourceType["OTHER"] = "OTHER";
})(SourceType || (exports.SourceType = SourceType = {}));
var Sentiment;
(function (Sentiment) {
    Sentiment["POSITIVE"] = "POSITIVE";
    Sentiment["NEUTRAL"] = "NEUTRAL";
    Sentiment["NEGATIVE"] = "NEGATIVE";
})(Sentiment || (exports.Sentiment = Sentiment = {}));
var AlertLevel;
(function (AlertLevel) {
    AlertLevel["LOW"] = "LOW";
    AlertLevel["MEDIUM"] = "MEDIUM";
    AlertLevel["CRITICAL"] = "CRITICAL";
})(AlertLevel || (exports.AlertLevel = AlertLevel = {}));
var AlertStatus;
(function (AlertStatus) {
    AlertStatus["NEW"] = "NEW";
    AlertStatus["IN_PROGRESS"] = "IN_PROGRESS";
    AlertStatus["RESOLVED"] = "RESOLVED";
})(AlertStatus || (exports.AlertStatus = AlertStatus = {}));
var ActionType;
(function (ActionType) {
    ActionType["RESPONSE"] = "RESPONSE";
    ActionType["PRIVATE_MESSAGE"] = "PRIVATE_MESSAGE";
    ActionType["ARTICLE"] = "ARTICLE";
})(ActionType || (exports.ActionType = ActionType = {}));
var ReportType;
(function (ReportType) {
    ReportType["DAILY"] = "DAILY";
    ReportType["WEEKLY"] = "WEEKLY";
    ReportType["MONTHLY"] = "MONTHLY";
})(ReportType || (exports.ReportType = ReportType = {}));
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "FREE";
    SubscriptionTier["STARTER"] = "STARTER";
    SubscriptionTier["PRO"] = "PRO";
    SubscriptionTier["ENTERPRISE"] = "ENTERPRISE";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
