module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/test/tsconfig.json",
    },
  },
  setupFiles: ["<rootDir>/test/setup.ts"],
  coverageReporters: ["json", "lcov", "text", "clover", "cobertura"],
};
