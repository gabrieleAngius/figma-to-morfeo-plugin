/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  setupFiles: ["<rootDir>/__mocks__/figmaMock.js"],
};
