import path from 'path';
import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ServiceWorkerWepbackPlugin from '../src/index';

const webpackConfig = {
  entry: './src/index.js',
  output: {
    path: '/',
    filename: '[name].[hash].js',
  },
  devtool: 'eval',
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new ServiceWorkerWepbackPlugin({
      entry: path.join(__dirname, 'src/sw.js'),
      excludes: [
        '**/.*',
        '**/*.map',
        '*.html',
      ],
    }),
    // new webpack.optimize.UglifyJsPlugin({
    //   compress: {
    //     warnings: false,
    //     screw_ie8: true,
    //     // unsafe: true,
    //     // unsafe_comps: true,
    //     // pure_getters: true,
    //   },
    //   output: {
    //     comments: false,
    //   },
    // }),
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
};

const server = new WebpackDevServer(webpack(webpackConfig), {
  // webpack-dev-server options
  hot: true,
  historyApiFallback: false,

  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  filename: 'bundle.js',
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
  stats: {
    modules: false,
    chunks: false,
    chunkModules: false,
    colors: true,
  },
});

server.listen(8001, 'localhost', () => {});
