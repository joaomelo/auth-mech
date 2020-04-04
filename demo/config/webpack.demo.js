'use strict';
const webpack = require('webpack');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const CircularDependencyPlugin = require('circular-dependency-plugin');

const src = path.resolve(__dirname, '../src');
const dist = path.resolve(__dirname, '../dist');
const lib = path.resolve(__dirname, '../../lib/src');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: ['./demo/src/index.js'],
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
    extensions: ['.js', '.json', '.vue']
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        use: 'eslint-loader',
        enforce: 'pre'
      },
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
      {
        test: /\.s(c|a)ss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
                indentedSyntax: true // optional
              }
            }
          }
        ]
      },
      {
        test: [/\.css$/],
        use: ['vue-style-loader', 'style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
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
    new Dotenv({ path: path.resolve(__dirname, './demo.env') }),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({ template: src + '/index.html' }),
    new VueLoaderPlugin(),
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      allowAsyncCycles: false,
      cwd: process.cwd()
    })
  ]
};
