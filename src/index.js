// @flow weak

import path from 'path';
import webpack from 'webpack';
import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin';
import minimatch from 'minimatch';

function validatePaths(assets, options) {
  const depth = options.filename.replace(/^\//, '').split('/').length;
  const basePath = Array(depth).join('../') || './';

  return assets
    .filter((asset) => !!asset)
    .map((key) => {
      // if absolute url, use it as is
      if (/^(?:\w+:)\/\//.test(key)) {
        return key;
      }

      key = key.replace(/^\//, '');

      if (options.publicPath !== '') {
        return options.publicPath + key;
      }

      return basePath + key;
    });
}

const ENTRY_NAME = 'serviceworker-plugin';

export default class ServiceWorkerPlugin {
  options = [];
  warnings = [];

  constructor(options) {
    if (options.relativePaths && options.publicPath) {
      this.warnings.push(
        new Error(`ServiceWorkerPlugin: publicPath is used in conjunction with relativePaths,
          relativePaths was set by the ServiceWorkerPlugin to false.`),
      );
    }

    this.options = Object.assign({
      publicPath: '',
      relativePaths: true,
      excludes: ['**/.*', '**/*.map'],
      entry: null,
      filename: 'sw.js',
    }, options);

    this.options.filename = this.options.filename.replace(/^\//, '');
  }

  apply(compiler) {
    const runtimePath = path.resolve(__dirname, './runtime.js');

    compiler.plugin('normal-module-factory', (nmf) => {
      nmf.plugin('after-resolve', (result, callback) => {
        // Hijack the original module
        if (result.resource === runtimePath) {
          const data = {
            scriptURL: this.options.publicPath + this.options.filename,
          };

          result.loaders.push(
            `${path.join(__dirname, 'runtimeLoader.js')}?${JSON.stringify(data)}`,
          );
        }

        callback(null, result);
      });
    });

    compiler.plugin('make', (compilation, callback) => {
      if (this.warnings.length) {
        [].push.apply(compilation.warnings, this.warnings);
      }

      this.handleMake(compilation, compiler)
        .then(() => {
          callback();
        })
        .catch(() => {
          callback(new Error('Something went wrong during the make event.'));
        });
    });

    compiler.plugin('emit', (compilation, callback) => {
      this.handleEmit(compilation, compiler);

      callback();
    });
  }

  handleMake(compilation, compiler) {
    const childCompiler = compilation.createChildCompiler(ENTRY_NAME, {
      filename: this.options.filename,
    });
    childCompiler.context = compiler.context;
    childCompiler.apply(
      new SingleEntryPlugin(compiler.context, this.options.entry, ENTRY_NAME),
    );

    // Fix for "Uncaught TypeError: __webpack_require__(...) is not a function"
    // Hot module replacement requires that every child compiler has its own
    // cache. @see https://github.com/ampedandwired/html-webpack-plugin/pull/179
    childCompiler.plugin('compilation', (compilation2) => {
      if (compilation2.cache) {
        if (!compilation2.cache[ENTRY_NAME]) {
          compilation2.cache[ENTRY_NAME] = {};
        }
        compilation2.cache = compilation2.cache[ENTRY_NAME];
      }
    });

    return new Promise((resolve, reject) => {
      childCompiler.runAsChild((err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  handleEmit(compilation, compiler) {
    const asset = compilation.assets[this.options.filename];

    if (!asset) {
      compilation.errors.push(
        new Error('ServiceWorkerPlugin: ServiceWorker entry is not found in output assets'),
      );

      return;
    }

    delete compilation.assets[this.options.filename];

    let assets = Object.keys(compilation.assets);
    const excludes = this.options.excludes;

    if (excludes.length > 0) {
      assets = assets.filter((assetCurrent) => {
        return !excludes.some((glob) => {
          return minimatch(assetCurrent, glob);
        });
      });
    }

    assets = validatePaths(assets, this.options);

    const minify = (compiler.options.plugins || []).some((plugin) => {
      return plugin instanceof webpack.optimize.UglifyJsPlugin;
    });

    const data = JSON.stringify({
      assets,
    }, null, minify ? 0 : 2);

    const source = `
      var serviceWorkerOption = ${data};
      ${asset.source()}
    `.trim();

    compilation.assets[this.options.filename] = {
      source() {
        return source;
      },
      size() {
        return Buffer.byteLength(source, 'utf8');
      },
    };
  }
}
