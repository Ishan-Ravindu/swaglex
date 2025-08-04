module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['standard', 'plugin:security/recommended'],
  plugins: ['security'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'rest-spread-spacing': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-parens': ['error', 'as-needed'],
    'arrow-body-style': ['error', 'as-needed'],
    'no-confusing-arrow': 'error',
    'implicit-arrow-linebreak': ['error', 'beside'],
    'max-len': [
      'warn',
      {
        code: 100,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true
      }
    ],
    complexity: ['warn', 10],
    'max-depth': ['warn', 4],
    'max-params': ['warn', 4],
    'security/detect-object-injection': 'warn'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off'
      }
    }
  ]
};
