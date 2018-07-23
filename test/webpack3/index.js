// @flow weak
/* eslint-env mocha */
import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import { assert, expect } from 'chai'
import ServiceWorkerPlugin from '../../src/index'

function trim(str) {
  return str.replace(/^\s+|\s+$/, '')
}

const filename = 'sw.js'
const webpackOutputPath = path.resolve('./tmp-build')
const makeWebpackConfig = options => ({
  entry: path.join(__dirname, '../test/test-build-entry'),
  plugins: [
    new ServiceWorkerPlugin({
      entry: path.join(__dirname, '../test/test-build-sw'),
      ...options,
    }),
  ],
})

describe('ServiceWorkerPlugin @ old webpack', () => {
  it('Should throw on older versions of webpack', () => {
    const options = makeWebpackConfig({})

    expect(() => {
      webpack(options, (err, stats) => {})
    }).to.throw('serviceworker-webpack-plugin requires webpack >= 4.')
  })
})
