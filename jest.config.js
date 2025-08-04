module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'lib/**/*.js',
    'bin/**/*.js',
    'index.js',
    '!lib/**/*.test.js',
    '!lib/**/*.spec.js',
    '!lib/templates/**',
    '!lib/ui/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/dist/', '/docs/'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],
  globalSetup: '<rootDir>/test/globalSetup.js',
  globalTeardown: '<rootDir>/test/globalTeardown.js',
  verbose: true,
  maxWorkers: 1,
  testTimeout: 30000
};
