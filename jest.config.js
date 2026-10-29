module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  testPathIgnorePatterns: ["int.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/server.js", "!src/repositorio.js"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
      statements: 80,
      branches: 70,
    },
  },
};
