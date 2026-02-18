const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
  },
};