module.exports = {
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended'],
  rules: {
    'prettier/prettier': ['error'],
    'no-console': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'array-element-newlline': ['error', 'consistent'],
  },
  env: {
    es2020: true,
    browser: true,
    node: true,
  },
};
