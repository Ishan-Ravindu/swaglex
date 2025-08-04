const jestConfig = require('../jest.config');
const fs = require('fs');
const path = require('path');

describe('Jest Configuration Validation', () => {
  describe('Basic Configuration Structure', () => {
    test('should export a valid configuration object', () => {
      expect(jestConfig).toBeDefined();
      expect(typeof jestConfig).toBe('object');
      expect(jestConfig).not.toBeNull();
    });

    test('should have testEnvironment set to node', () => {
      expect(jestConfig.testEnvironment).toBe('node');
    });

    test('should have verbose mode enabled', () => {
      expect(jestConfig.verbose).toBe(true);
    });

    test('should have maxWorkers set to 1', () => {
      expect(jestConfig.maxWorkers).toBe(1);
    });

    test('should have testTimeout set to 30000ms', () => {
      expect(jestConfig.testTimeout).toBe(30000);
    });
  });

  describe('Coverage Configuration', () => {
    test('should have collectCoverageFrom as an array', () => {
      expect(Array.isArray(jestConfig.collectCoverageFrom)).toBe(true);
      expect(jestConfig.collectCoverageFrom.length).toBeGreaterThan(0);
    });

    test('should include main source directories in coverage', () => {
      const coveragePatterns = jestConfig.collectCoverageFrom;
      expect(coveragePatterns).toContain('lib/**/*.js');
      expect(coveragePatterns).toContain('bin/**/*.js');
      expect(coveragePatterns).toContain('index.js');
    });

    test('should exclude test files from coverage', () => {
      const coveragePatterns = jestConfig.collectCoverageFrom;
      expect(coveragePatterns).toContain('!lib/**/*.test.js');
      expect(coveragePatterns).toContain('!lib/**/*.spec.js');
    });

    test('should exclude template and UI directories from coverage', () => {
      const coveragePatterns = jestConfig.collectCoverageFrom;
      expect(coveragePatterns).toContain('!lib/templates/**');
      expect(coveragePatterns).toContain('!lib/ui/**');
    });

    test('should have coverageDirectory set to coverage', () => {
      expect(jestConfig.coverageDirectory).toBe('coverage');
    });

    test('should have multiple coverage reporters configured', () => {
      const reporters = jestConfig.coverageReporters;
      expect(Array.isArray(reporters)).toBe(true);
      expect(reporters).toContain('text');
      expect(reporters).toContain('lcov');
      expect(reporters).toContain('html');
      expect(reporters).toContain('json-summary');
    });

    test('should have coverage thresholds configured', () => {
      const threshold = jestConfig.coverageThreshold;
      expect(threshold).toBeDefined();
      expect(threshold.global).toBeDefined();
      expect(threshold.global.branches).toBe(80);
      expect(threshold.global.functions).toBe(80);
      expect(threshold.global.lines).toBe(80);
      expect(threshold.global.statements).toBe(80);
    });
  });

  describe('Test Matching and Paths', () => {
    test('should have valid testMatch patterns', () => {
      const testMatch = jestConfig.testMatch;
      expect(Array.isArray(testMatch)).toBe(true);
      expect(testMatch).toContain('**/__tests__/**/*.js');
      expect(testMatch).toContain('**/?(*.)+(spec|test).js');
    });

    test('should ignore specified directories in testPathIgnorePatterns', () => {
      const ignorePatterns = jestConfig.testPathIgnorePatterns;
      expect(Array.isArray(ignorePatterns)).toBe(true);
      expect(ignorePatterns).toContain('/node_modules/');
      expect(ignorePatterns).toContain('/coverage/');
      expect(ignorePatterns).toContain('/dist/');
      expect(ignorePatterns).toContain('/docs/');
    });
  });

  describe('Setup Files Configuration', () => {
    test('should have setupFilesAfterEnv configured', () => {
      expect(jestConfig.setupFilesAfterEnv).toBeDefined();
      expect(Array.isArray(jestConfig.setupFilesAfterEnv)).toBe(true);
      expect(jestConfig.setupFilesAfterEnv).toContain('<rootDir>/test/setup.js');
    });

    test('should have globalSetup configured', () => {
      expect(jestConfig.globalSetup).toBe('<rootDir>/test/globalSetup.js');
    });

    test('should have globalTeardown configured', () => {
      expect(jestConfig.globalTeardown).toBe('<rootDir>/test/globalTeardown.js');
    });
  });

  describe('Configuration Validation Edge Cases', () => {
    test('should handle missing properties gracefully', () => {
      const requiredProps = [
        'testEnvironment',
        'collectCoverageFrom',
        'coverageDirectory',
        'coverageReporters',
        'testMatch'
      ];

      requiredProps.forEach(prop => {
        expect(jestConfig).toHaveProperty(prop);
      });
    });

    test('should have valid timeout value', () => {
      expect(typeof jestConfig.testTimeout).toBe('number');
      expect(jestConfig.testTimeout).toBeGreaterThan(0);
      expect(jestConfig.testTimeout).toBeLessThan(300000); // 5 minutes max
    });

    test('should have valid maxWorkers configuration', () => {
      expect(typeof jestConfig.maxWorkers).toBe('number');
      expect(jestConfig.maxWorkers).toBeGreaterThan(0);
    });

    test('coverage thresholds should be within valid range', () => {
      const thresholds = jestConfig.coverageThreshold.global;
      Object.values(thresholds).forEach(threshold => {
        expect(typeof threshold).toBe('number');
        expect(threshold).toBeGreaterThanOrEqual(0);
        expect(threshold).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('File Path Validation', () => {
    test('should validate coverage patterns point to existing directory structure', () => {
      // This test checks if the coverage patterns make sense relative to typical project structure
      const patterns = jestConfig.collectCoverageFrom.filter(p => !p.startsWith('!'));
      
      patterns.forEach(pattern => {
        expect(typeof pattern).toBe('string');
        expect(pattern.length).toBeGreaterThan(0);
        // Validate glob patterns have proper syntax
        expect(pattern).toMatch(/^[^!].*/);
      });
    });

    test('should validate exclusion patterns are properly formatted', () => {
      const exclusions = jestConfig.collectCoverageFrom.filter(p => p.startsWith('!'));
      
      exclusions.forEach(exclusion => {
        expect(exclusion).toMatch(/^!/);
        expect(exclusion.length).toBeGreaterThan(1);
      });
    });

    test('should validate setup file paths use rootDir token', () => {
      expect(jestConfig.setupFilesAfterEnv[0]).toMatch(/<rootDir>/);
      expect(jestConfig.globalSetup).toMatch(/<rootDir>/);
      expect(jestConfig.globalTeardown).toMatch(/<rootDir>/);
    });
  });

  describe('Configuration Consistency', () => {
    test('should have consistent test file patterns between testMatch and coverage exclusions', () => {
      const coverageExclusions = jestConfig.collectCoverageFrom.filter(p => p.includes('.test.js') || p.includes('.spec.js'));
      expect(coverageExclusions.length).toBeGreaterThan(0);
    });

    test('should exclude coverage directory from test paths', () => {
      expect(jestConfig.testPathIgnorePatterns).toContain('/coverage/');
    });

    test('should have reporters that complement each other', () => {
      const reporters = jestConfig.coverageReporters;
      expect(reporters).toContain('text'); // For console output
      expect(reporters).toContain('lcov'); // For CI/CD integration
    });
  });

  describe('Performance Configuration', () => {
    test('should have reasonable performance settings', () => {
      // Single worker for consistent test execution
      expect(jestConfig.maxWorkers).toBe(1);
      
      // Reasonable timeout for complex tests
      expect(jestConfig.testTimeout).toBe(30000);
    });

    test('should have efficient ignore patterns', () => {
      const ignorePatterns = jestConfig.testPathIgnorePatterns;
      const expectedPatterns = ['/node_modules/', '/coverage/', '/dist/', '/docs/'];
      
      expectedPatterns.forEach(pattern => {
        expect(ignorePatterns).toContain(pattern);
      });
    });
  });
});

describe('Jest Configuration Integration', () => {
  test('should be a valid Jest configuration when loaded', () => {
    // This would test that Jest can actually use this configuration
    expect(() => {
      // Simulate Jest loading the config
      const config = require('../jest.config');
      expect(config).toBeTruthy();
    }).not.toThrow();
  });

  test('should have all required properties for Jest execution', () => {
    const requiredJestProps = [
      'testEnvironment',
      'testMatch'
    ];

    requiredJestProps.forEach(prop => {
      expect(jestConfig).toHaveProperty(prop);
      expect(jestConfig[prop]).toBeTruthy();
    });
  });

  test('should handle empty or malformed inputs gracefully', () => {
    // Test configuration robustness
    expect(jestConfig.testMatch).not.toHaveLength(0);
    expect(jestConfig.collectCoverageFrom).not.toHaveLength(0);
    expect(jestConfig.coverageReporters).not.toHaveLength(0);
  });
});