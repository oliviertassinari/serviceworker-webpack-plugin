// @flow weak
/* eslint-env mocha */

import webpack from 'webpack'
import path from 'path'
import fs from 'fs'
import rimraf from 'rimraf'
import { assert, expect } from 'chai'
import ServiceWorkerPlugin from './index'

function trim(str) {
  return str.replace(/^\s+|\s+$/, '')
}

const filename = 'sw.js'
const webpackOutputPath = path.resolve('./tmp-build')
const outputOptions = {
  path: webpackOutputPath,
  // these are the defaults from https://github.com/webpack/webpack/blob/master/lib/WebpackOptionsDefaulter.js#L164
  hashFunction: 'md4',
  hashDigest: 'hex',
  hashDigestLength: 20,
}
const makeWebpackConfig = options => ({
  entry: path.join(__dirname, '../test/test-build-entry'),
  mode: 'development',
  devtool: false,
  plugins: [
    new ServiceWorkerPlugin({
      entry: path.join(__dirname, '../test/test-build-sw'),
      ...options,
    }),
  ],
  resolve: {
    alias: {
      'serviceworker-webpack-plugin/lib/runtime': path.join(__dirname, 'runtime.js'),
    },
  },
  output: outputOptions,
})
const fakeOptions = { output: outputOptions }

describe('ServiceWorkerPlugin', () => {
  beforeEach(done => {
    return rimraf(webpackOutputPath, done)
  })
  describe('options: filename', () => {
    it('should throw if trying to hash the filename', () => {
      assert.throws(() => {
        // eslint-disable-next-line no-new
        new ServiceWorkerPlugin({
          filename: 'sw-[hash:7].js',
        })
      }, /The name of the/)
    })
    it('should strip double slashes', done => {
      const options = makeWebpackConfig({
        filename: '//sw.js',
      })
      return webpack(options, (err, stats) => {
        expect(err).to.equal(null)
        const { assetsByChunkName, errors, warnings } = stats.toJson()
        expect(errors).to.have.length(0)
        expect(warnings).to.have.length(0)

        const mainFile = fs.readFileSync(
          path.join(webpackOutputPath, assetsByChunkName.main),
          'utf8'
        )
        expect(mainFile).to.include('var serviceWorkerOption = {"scriptURL":"/sw.js"}')
        done()
      })
    })
  })

  it('should correctly generate a service worker', () => {
    const options = makeWebpackConfig({
      filename: '//sw.js',
    })
    return webpack(options, (err, stats) => {
      expect(err).to.equal(null)
      const { assetsByChunkName, errors, warnings } = stats.toJson()
      expect(errors).to.have.length(0)
      expect(warnings).to.have.length(0)

      const swFile = fs
        .readFileSync(path.join(webpackOutputPath, 'sw.js'), 'utf8')
        .replace(/\s+/g, ' ')

      // sw.js should reference main.js
      expect(swFile).to.include('var serviceWorkerOption = { "assets": [ "/main.js" ] }')
      // sw.js should include the webpack require code
      expect(swFile).to.include('function __webpack_require__(moduleId)')
    })
  })

  describe('options: includes', () => {
    it('should allow to have a white list parameter', () => {
      const serviceWorkerPlugin = new ServiceWorkerPlugin({
        filename,
        includes: ['bar.*'],
      })

      const compilation = {
        options: fakeOptions,
        assets: {
          [filename]: {
            source: () => '',
          },
          'bar.js': {},
          'foo.js': {},
        },
        getStats: () => ({
          toJson: () => ({}),
        }),
      }

      return serviceWorkerPlugin.handleEmit(
        compilation,
        {
          options: {},
        },
        () => {
          assert.strictEqual(
            compilation.assets[filename].source(),
            trim(`
var serviceWorkerOption = {
  "assets": [
    "/bar.js"
  ]
};`)
          )
        }
      )
    })

    describe('options: transformOptions', () => {
      it('should be used', () => {
        const transformOptions = serviceWorkerOption => ({
          bar: 'foo',
          jsonStats: serviceWorkerOption.jsonStats,
        })

        const serviceWorkerPlugin = new ServiceWorkerPlugin({
          filename,
          transformOptions,
        })

        const compilation = {
          options: fakeOptions,
          assets: {
            [filename]: {
              source: () => '',
            },
          },
          getStats: () => ({
            toJson: () => ({
              foo: 'bar',
            }),
          }),
        }

        return serviceWorkerPlugin.handleEmit(
          compilation,
          {
            options: {},
          },
          () => {
            assert.strictEqual(
              compilation.assets[filename].source(),
              trim(`
var serviceWorkerOption = {
  "bar": "foo",
  "jsonStats": {
    "foo": "bar"
  }
};`)
            )
          }
        )
      }),
        it('should get passed assetsHash', done => {
          const transformOptions = serviceWorkerOption => {
            expect(serviceWorkerOption)
              .to.have.property('assetsHash')
              .that.is.equal('bd90271e0847dcc66adb')
          }

          const serviceWorkerPlugin = new ServiceWorkerPlugin({
            filename,
            transformOptions,
          })

          const compilation = {
            options: fakeOptions,
            assets: {
              [filename]: {
                source: () => '',
              },
              'bar-v1.js': {},
            },
            getStats: () => ({
              toJson: () => ({}),
            }),
          }

          return serviceWorkerPlugin.handleEmit(
            compilation,
            {
              options: {},
            },
            done
          )
        }),
        it('should change assetsHash when filename changes', done => {
          const transformOptions = serviceWorkerOption => {
            expect(serviceWorkerOption)
              .to.have.property('assetsHash')
              .that.is.equal('47633aad38a6adaca6ec')
          }

          const serviceWorkerPlugin = new ServiceWorkerPlugin({
            filename,
            transformOptions,
          })

          const compilation = {
            options: fakeOptions,
            assets: {
              [filename]: {
                source: () => '',
              },
              'bar-v2.js': {},
            },
            getStats: () => ({
              toJson: () => ({}),
            }),
          }

          return serviceWorkerPlugin.handleEmit(
            compilation,
            {
              options: {},
            },
            done
          )
        })
    })
  })
})
