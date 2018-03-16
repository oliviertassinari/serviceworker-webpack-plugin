import minimatch from 'minimatch';
import path from 'path';

const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');

function validatePaths(assets: any, options: any) {
  const depth = options.filename.replace(/^\//, '').split('/').length;
  const basePath = Array(depth).join('../') || './';

  return assets.filter((asset: any) => !!asset).map((key: any) => {
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

const COMPILER_NAME = 'serviceworker-plugin';

export default class ServiceWorkerPlugin {
  public options: any = {};
  public warnings: any[] = [];

  constructor(options: any) {
    this.options = {
      publicPath: '/',
      excludes: ['**/.*', '**/*.map'],
      includes: ['**/*'],
      entry: null,
      filename: 'sw.js',
      template: () => Promise.resolve(''),
      transformOptions: (serviceWorkerOption: any) => ({
        assets: serviceWorkerOption.assets,
      }),
      minimize: process.env.NODE_ENV === 'production',
      ...options,
    };

    if (this.options.filename.match(/\[hash/)) {
      throw new Error(`The name of the service worker need to fixed across releases.
        https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/lifecycle#avoid_changing_the_url_of_your_service_worker_script`);
    }
  }

  public apply(compiler: any) {
    const runtimePath = path.resolve(__dirname, './runtime.js');

    compiler.hooks.normalModuleFactory.tap('sw-plugin-nmf', (nmf: any) => {
      nmf.hooks.afterResolve.tapAsync('sw-plugin-after-resolve', (result: any, callback: any) => {
        // Hijack the original module
        if (result.resource === runtimePath) {
          const data = {
            scriptURL: this.options.publicPath + this.options.filename,
          };

          result.loaders.push(
            `${path.join(__dirname, 'runtimeLoader.js')}?${JSON.stringify(data)}`
          );
        }

        callback(null, result);
      });
    });

    compiler.hooks.make.tapAsync('sw-plugin-make', (compilation: any, callback: any) => {
      if (this.warnings.length) {
        const array: any[] = [];
        array.push.apply(compilation.warnings, this.warnings);
      }

      this.handleMake(compilation, compiler)
        .then(() => {
          callback();
        })
        .catch(() => {
          callback(new Error('Something went wrong during the make event.'));
        });
    });

    compiler.hooks.emit.tapAsync('sw-plugin-emit', (compilation: any, callback: any) => {
      this.handleEmit(compilation, compiler, callback);
    });
  }

  public handleMake(compilation: any, compiler: any) {
    const childCompiler = compilation.createChildCompiler(COMPILER_NAME, {
      filename: this.options.filename,
    });
    childCompiler.context = compiler.context;
    childCompiler.apply(new SingleEntryPlugin(compiler.context, this.options.entry));

    // Fix for "Uncaught TypeError: __webpack_require__(...) is not a function"
    // Hot module replacement requires that every child compiler has its own
    // cache. @see https://github.com/ampedandwired/html-webpack-plugin/pull/179
    childCompiler.hooks.compilation.tap('sw-plugin-compilation', (compilation2: any) => {
      if (compilation2.cache) {
        if (!compilation2.cache[COMPILER_NAME]) {
          compilation2.cache[COMPILER_NAME] = {};
        }
        compilation2.cache = compilation2.cache[COMPILER_NAME];
      }
    });

    // Compile and return a promise.
    return new Promise((resolve, reject) => {
      childCompiler.runAsChild((err: any) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }

  public handleEmit(compilation: any, compiler: any, callback: any) {
    const asset = compilation.assets[this.options.filename];

    if (!asset) {
      compilation.errors.push(new Error('ServiceWorkerPlugin: the `entry` option is incorrect.'));
      callback();
      return;
    }

    const jsonStats = compilation.getStats().toJson({
      hash: false,
      publicPath: false,
      assets: true,
      chunks: false,
      modules: true,
      source: false,
      errorDetails: false,
      timings: false,
    });

    delete compilation.assets[this.options.filename];

    let assets = Object.keys(compilation.assets);
    const excludes = this.options.excludes;

    if (excludes.length > 0) {
      assets = assets.filter(assetCurrent => {
        return !excludes.some((glob: any) => {
          return minimatch(assetCurrent, glob);
        });
      });
    }

    const includes = this.options.includes;

    if (includes.length > 0) {
      assets = assets.filter(assetCurrent => {
        return includes.some((glob: any) => {
          return minimatch(assetCurrent, glob);
        });
      });
    }

    assets = validatePaths(assets, this.options);

    const serviceWorkerOption = this.options.transformOptions({
      assets,
      jsonStats,
    });

    const templatePromise = this.options.template(serviceWorkerOption);

    templatePromise.then((template: any) => {
      const serviceWorkerOptionInline = JSON.stringify(
        serviceWorkerOption,
        null,
        this.options.minimize ? 0 : 2
      );

      const source = `
        var serviceWorkerOption = ${serviceWorkerOptionInline};
        ${template}
        ${asset.source()}
      `.trim();

      compilation.assets[this.options.filename] = {
        source: () => source,
        size: () => Buffer.byteLength(source, 'utf8'),
      };

      callback();
    });
  }
}
