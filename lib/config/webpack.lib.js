'use strict';
const path = require('path');
const Dotenv = require('dotenv-webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const dist = path.resolve(__dirname, '../dist');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: ['./lib/src/index.js'],
  output: {
    path: dist,
    filename: 'index.js',
    libraryTarget: 'umd',
    globalObject: 'this',
    library: 'lib_template'
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: 'eslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  },
  plugins: [
    new Dotenv({ path: path.resolve(__dirname, './lib.env') }),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      allowAsyncCycles: false,
      cwd: process.cwd()
    })
  ]
};
