module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/extension.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleFileExtensions: ["ts", "js", "json"],
  testTimeout: 10000,
  moduleNameMapper: {
    "^vscode$": "<rootDir>/src/tests/__mocks__/vscode.ts",
  },
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "commonjs",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },
};
