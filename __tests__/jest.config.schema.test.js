const jestConfig = require('../jest.config');

describe('Jest Configuration Schema Validation', () => {
  const configSchema = {
    testEnvironment: 'string',
    collectCoverageFrom: 'array',
    coverageDirectory: 'string',
    coverageReporters: 'array',
    coverageThreshold: 'object',
    testMatch: 'array',
    testPathIgnorePatterns: 'array',
    setupFilesAfterEnv: 'array',
    globalSetup: 'string',
    globalTeardown: 'string',
    verbose: 'boolean',
    maxWorkers: 'number',
    testTimeout: 'number'
  };

  describe('Type Validation', () => {
    Object.entries(configSchema).forEach(([key, expectedType]) => {
      test(`${key} should be of type ${expectedType}`, () => {
        expect(jestConfig).toHaveProperty(key);
        
        if (expectedType === 'array') {
          expect(Array.isArray(jestConfig[key])).toBe(true);
        } else {
          expect(typeof jestConfig[key]).toBe(expectedType);
        }
      });
    });
  });

  describe('Required Properties', () => {
    test('should have all essential Jest configuration properties', () => {
      const essentialProps = ['testEnvironment', 'testMatch'];
      
      essentialProps.forEach(prop => {
        expect(jestConfig).toHaveProperty(prop);
        expect(jestConfig[prop]).toBeDefined();
        expect(jestConfig[prop]).not.toBeNull();
      });
    });
  });

  describe('Array Properties Validation', () => {
    const arrayProps = ['collectCoverageFrom', 'coverageReporters', 'testMatch', 'testPathIgnorePatterns', 'setupFilesAfterEnv'];
    
    arrayProps.forEach(prop => {
      test(`${prop} should be a non-empty array`, () => {
        expect(Array.isArray(jestConfig[prop])).toBe(true);
        expect(jestConfig[prop].length).toBeGreaterThan(0);
      });

      test(`${prop} should contain only strings`, () => {
        jestConfig[prop].forEach(item => {
          expect(typeof item).toBe('string');
          expect(item.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Nested Object Validation', () => {
    test('coverageThreshold should have valid structure', () => {
      const threshold = jestConfig.coverageThreshold;
      expect(threshold).toHaveProperty('global');
      expect(typeof threshold.global).toBe('object');
      
      const requiredMetrics = ['branches', 'functions', 'lines', 'statements'];
      requiredMetrics.forEach(metric => {
        expect(threshold.global).toHaveProperty(metric);
        expect(typeof threshold.global[metric]).toBe('number');
      });
    });
  });

  describe('Value Range Validation', () => {
    test('coverage thresholds should be valid percentages', () => {
      const thresholds = jestConfig.coverageThreshold.global;
      Object.values(thresholds).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });

    test('testTimeout should be reasonable', () => {
      expect(jestConfig.testTimeout).toBeGreaterThan(1000); // At least 1 second
      expect(jestConfig.testTimeout).toBeLessThan(600000); // Less than 10 minutes
    });

    test('maxWorkers should be positive', () => {
      expect(jestConfig.maxWorkers).toBeGreaterThan(0);
      expect(jestConfig.maxWorkers).toBeLessThan(100); // Reasonable upper bound
    });
  });
});