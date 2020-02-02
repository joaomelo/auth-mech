module.exports = {
  collectCoverage: true,
  coverageDirectory: 'lib/coverage/',
  collectCoverageFrom: [
    'lib/src/*.js',
    '!lib/src/index.js'
  ]
};
