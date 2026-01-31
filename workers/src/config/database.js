"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const database_1 = require("@sentinelle/database");
exports.prisma = new database_1.PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});
