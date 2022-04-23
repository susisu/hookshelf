"use strict";

module.exports = {
  roots: ["./src"],
  testMatch: ["**/*.{test,spec}.*"],
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: ["./src/**/*", "!./src/**/*.{test,spec}.*", "!./src/**/__tests__/**/*"],
  coverageDirectory: "coverage",
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.test.json",
    },
  },
  transform: {
    "\\.tsx?$": "ts-jest",
  },
};
