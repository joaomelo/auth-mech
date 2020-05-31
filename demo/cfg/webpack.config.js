'use strict';
const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const src = path.resolve(__dirname, '../src');
const dist = path.resolve(__dirname, '../dist');
const lib = path.resolve(__dirname, '../../lib/src');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    hot: true,
    port: 8080,
    historyApiFallback: true,
    noInfo: false,
    stats: 'normal',
    watchOptions: {
      poll: true
    }
  },
  entry: [`${src}/index.js`],
  output: {
    publicPath: '/',
    path: dist,
    filename: 'bundle.js'
  },
  resolve: {
    alias: {
      __src: src,
      __lib: lib
    },
    extensions: ['.js', '.json']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'eslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.js$/,
        use: 'babel-loader'
      },
      {
        test: [/\.css$/],
        use: ['style-loader', 'css-loader']
      },
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      allowAsyncCycles: false,
      cwd: process.cwd()
    }),
    new Dotenv({ path: path.resolve(__dirname, './demo.env') }),
    new HtmlWebpackPlugin({ template: `${src}/index.html` })
  ]
};
