// @flow weak
/* eslint-env mocha */

import { assert } from 'chai';
import ServiceWorkerPlugin from './index';

function trim(str) {
  return str.replace(/^\s+|\s+$/, '');
}

describe('ServiceWorkerPlugin', () => {
  describe('options: includes', () => {
    it('should allow to have a white list parameter', () => {
      const filename = 'sw.js';
      const serviceWorkerPlugin = new ServiceWorkerPlugin({
        filename,
        includes: ['bar.*'],
      });

      const compilation = {
        assets: {
          [filename]: {
            source: () => '',
          },
          'bar.js': {},
          'foo.js': {},
        },
      };

      return serviceWorkerPlugin
        .handleEmit(compilation, {
          options: {},
        }, () => {})
        .then(() => {
          assert.strictEqual(compilation.assets[filename].source(), trim(`
var serviceWorkerOption = {
  "assets": [
    "/bar.js"
  ]
};`));
        });
    });
  });
});
