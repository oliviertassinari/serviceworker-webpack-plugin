// @flow weak
/* eslint-env mocha */

import { assert } from 'chai'
import ServiceWorkerPlugin from './index'

function trim(str) {
  return str.replace(/^\s+|\s+$/, '')
}

const filename = 'sw.js'

describe('ServiceWorkerPlugin', () => {
  describe('options: filename', () => {
    it('should throw if trying to hash the filename', () => {
      assert.throws(() => {
        // eslint-disable-next-line no-new
        new ServiceWorkerPlugin({
          filename: 'sw-[hash:7].js',
        })
      }, /The name of the/)
    })
  })

  describe('options: includes', () => {
    it('should allow to have a white list parameter', () => {
      const serviceWorkerPlugin = new ServiceWorkerPlugin({
        filename,
        includes: ['bar.*'],
      })

      const compilation = {
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
      })
    })
  })
})
