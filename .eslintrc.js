module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['babel', 'prettier'],
  extends: ['eslint:recommended'],
  rules: {
    'prettier/prettier': ['error'],
    'comma-dangle': ['error', 'only-multiline'],
  },
  env: {
    es2020: true,
    browser: true,
    node: true,
  },
};
