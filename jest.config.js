/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coveragePathIgnorePatterns: ['src/app/index.tsx'],
  setupFiles: ["<rootDir>/__mocks__/figmaMock.js"],
};
