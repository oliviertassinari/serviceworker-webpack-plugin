// @flow weak

import path from 'path'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import ServiceWorkerWebpackPlugin from '../../src/index'

export default {
  entry: ['./docs/src/app.js'],
  output: {
    pathinfo: false,
    path: path.join(__dirname, '../dist'), // No used by webpack dev server
    publicPath: '',
    filename: 'app.js',
  },
  target: 'web',
  resolve: {
    extensions: ['.js'],
    alias: {
      'serviceworker-webpack-plugin/lib': path.resolve(__dirname, '../../src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../src/index.html'),
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, '../src/sw.js'),
      excludes: ['**/.*', '**/*.map', '*.html'],
    }),
  ],
}
