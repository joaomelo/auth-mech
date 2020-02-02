module.exports = {
  env: {
    'jest/globals': true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    semi: ['error', 'always'],
    'jest/no-test-callback': 'off'
  },
  extends: [
    'standard',
    'plugin:vue/recommended',
    'plugin:jest/all'
  ],
  plugins: ['vue', 'jest']
};
