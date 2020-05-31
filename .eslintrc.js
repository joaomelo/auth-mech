module.exports = {
  parserOptions: {
    parser: 'babel-eslint'
  },
  ignorePatterns: ['*/dist/*'],
  rules: {
    semi: ['error', 'always'],
    'no-debugger': 'off'
  },
  extends: [
    'standard'
  ],
};
