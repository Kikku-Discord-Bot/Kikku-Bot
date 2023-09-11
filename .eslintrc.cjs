/* eslint-env node */
module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    parserOptions: {
        "project": "./tsconfig.json",
    },
    rules: {
        "indent": ["error", "tab"],
        "quotes": ["error", "double"],
        "no-explicit-any": "off",
    },
    ignorePatterns: ['node_modules/', 'coverage/', 'docs/'],
  };