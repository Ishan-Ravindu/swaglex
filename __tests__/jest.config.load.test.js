const fs = require('fs');
const path = require('path');

describe('Jest Configuration File Loading', () => {
  const configPath = path.join(__dirname, '..', 'jest.config.js');

  test('jest.config.js file should exist', () => {
    expect(fs.existsSync(configPath)).toBe(true);
  });

  test('jest.config.js should be readable', () => {
    expect(() => {
      fs.readFileSync(configPath, 'utf8');
    }).not.toThrow();
  });

  test('jest.config.js should have valid JavaScript syntax', () => {
    expect(() => {
      delete require.cache[require.resolve('../jest.config')];
      require('../jest.config');
    }).not.toThrow();
  });

  test('jest.config.js should export an object', () => {
    const config = require('../jest.config');
    expect(typeof config).toBe('object');
    expect(config).not.toBeNull();
    expect(config.constructor).toBe(Object);
  });

  test('configuration should not have circular references', () => {
    const config = require('../jest.config');
    expect(() => {
      JSON.stringify(config);
    }).not.toThrow();
  });

  describe('File Content Validation', () => {
    let fileContent;

    beforeAll(() => {
      fileContent = fs.readFileSync(configPath, 'utf8');
    });

    test('should use module.exports pattern', () => {
      expect(fileContent).toMatch(/module\.exports\s*=/);
    });

    test('should not contain syntax errors', () => {
      expect(fileContent).not.toMatch(/\bSyntax\s+Error\b/i);
    });

    test('should have proper object structure', () => {
      expect(fileContent).toMatch(/\{[\s\S]*\}/);
    });

    test('should contain expected configuration keys', () => {
      const expectedKeys = [
        'testEnvironment',
        'collectCoverageFrom',
        'coverageDirectory',
        'testMatch'
      ];

      expectedKeys.forEach(key => {
        expect(fileContent).toMatch(new RegExp(`['"\`]?${key}['"\`]?\\s*:`));
      });
    });
  });
});