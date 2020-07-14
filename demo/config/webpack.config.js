'use strict';
const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { merge } = require('webpack-merge');
const common = require('../../webpack.common.js');

const demoSrc = path.resolve(__dirname, '../src');
const demoDist = path.resolve(__dirname, '../dist');
const libSrc = path.resolve(__dirname, '../../lib/src');

module.exports = merge(common, {
  mode: 'development',
  entry: [`${demoSrc}/index.js`],
  resolve: {
    alias: {
      __demo: demoSrc,
      __lib: libSrc
    }
  },
  output: {
    publicPath: '/',
    path: demoDist,
    filename: 'bundle.js'
  },
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
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new Dotenv({ path: path.resolve(__dirname, './demo.env') }),
    new HtmlWebpackPlugin({ template: `${demoSrc}/index.html` })
  ]
});
