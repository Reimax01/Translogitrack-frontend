module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["@babel/preset-react"] }],
  },
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testMatch: ["<rootDir>/src/**/__tests__/**/*.(js|jsx|ts|tsx)", "<rootDir>/src/**/?(*.)(spec|test).(js|jsx|ts|tsx)"],
  collectCoverageFrom: ["src/**/*.(js|jsx|ts|tsx)", "!src/**/*.d.ts", "!src/index.js", "!src/setupTests.js"],
}
