// @flow weak

import webpack from 'webpack'
import ForceCaseSensitivityPlugin from 'force-case-sensitivity-webpack-plugin'
import baseConfig from './baseConfig'

const PORT = 8002

export default {
  ...baseConfig,
  output: {
    ...baseConfig.output,
    // * filename */ comments to generated require()s in the output.
    pathinfo: true,
    publicPath: '/',
  },
  // webpack-dev-server options.
  devServer: {
    // activate hot reloading.
    hot: true,
    historyApiFallback: true,
    port: PORT,
    disableHostCheck: true, // For security checks, no need here.

    // webpack-dev-middleware options.
    stats: {
      // Remove built modules information.
      modules: false,
      // Remove built modules information to chunk information.
      chunkModules: false,
      colors: true,
    },
  },
  module: {
    rules: [
      ...baseConfig.module.rules.map(rule => {
        if (rule.loader === 'babel-loader') {
          return {
            ...rule,
            options: {
              presets: [
                [
                  'es2015',
                  {
                    modules: false,
                  },
                ],
                'react',
                'stage-1',
              ],
              plugins: ['react-hot-loader/babel'],
            },
          }
        }

        return rule
      }),
    ],
  },
  devtool: 'eval', // no SourceMap, but named modules. Fastest at the expense of detail.
  plugins: [
    ...baseConfig.plugins,
    // Prevent naming issues.
    new ForceCaseSensitivityPlugin(),
    // Activates HMR.
    new webpack.HotModuleReplacementPlugin(),
    // Prints more readable module names in the browser console on HMR updates.
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
      },
    }),
  ],
}
