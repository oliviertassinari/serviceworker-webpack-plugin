// @flow weak

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import autoprefixer from 'autoprefixer';
import ExtractTextPlugin from 'extract-text-webpack-plugin';
import ServiceWorkerWebpackPlugin from '../src/index';

export default function (options) {
  const webpackConfig = {
    entry: [
      './src/app.js',
    ],
    output: {
      path: path.join(__dirname, 'dist'), // No used by webpack dev server
      filename: '[name].[hash].js',
    },
    resolve: {
      extensions: ['', '.js'],
      alias: {
        'serviceworker-webpack-plugin/lib': path.resolve(__dirname, '../src'),
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/index.html'),
        minify: {
          removeComments: true,
          collapseWhitespace: true,
        },
      }),
      new ServiceWorkerWebpackPlugin({
        entry: path.join(__dirname, 'src/sw.js'),
        excludes: [
          '**/.*',
          '**/*.map',
          '*.html',
        ],
      }),
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify(options.config.environment),
        },
      }),
    ],
    postcss: [
      autoprefixer,
    ],
    module: {},
    devtool: (options.config.environment === 'development') ? 'eval' : null,
  };

  if (options.config.environment === 'development') {
    webpackConfig.module.loaders = [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        loaders: [
          'style-loader',
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
    ];
  } else if (options.config.environment === 'production') {
    webpackConfig.plugins = webpackConfig.plugins.concat([
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin({
        compressor: {
          warnings: false,
        },
        output: {
          comments: false,
        },
      }),
      new ExtractTextPlugin('app.css'),
    ]);

    webpackConfig.module.loaders = [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(
          'style-loader',
          'css-loader!postcss-loader!sass-loader',
        ),
      },
    ];
  }

  return webpackConfig;
}
