const tseslint = require('typescript-eslint');
const eslintPluginPrettier = require('eslint-plugin-prettier');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', '*.js', '!eslint.config.js'],
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Code Quality
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Module Boundary Enforcement
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/modules/*/!(types|dto)/**'],
              message:
                'Modules can only import types/DTOs from other modules, not services or controllers.',
            },
          ],
        },
      ],

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
];
