import * as path                                            from 'path';
import * as fs                                              from 'fs';
import * as rimraf                                          from 'rimraf';
import * as webpack                                         from 'webpack';
import { IServiceWorkerPluginOptions, ServiceWorkerPlugin } from './serviceWorkerPlugin';

function trim(str: string) {
    return str.replace(/^\s+|\s+$/, '');
}

const filename = 'sw.js';
const webpackOutputPath = path.resolve('./tmp-build');
const makeWebpackConfig = (options: IServiceWorkerPluginOptions): webpack.Configuration => ({
    entry:   path.join(__dirname, '../test/test-build-entry'),
    mode:    'development',
    devtool: false,
    plugins: [
        new ServiceWorkerPlugin({ entry: path.join(__dirname, '../test/test-build-sw'), ...options }),
    ],
    resolve: {
        alias: {
            'serviceworker-webpack-plugin/lib/runtime': path.join(__dirname, '..', 'lib', 'runtime.js'),
        },
    },
    output:  {
        path: webpackOutputPath,
    },
});

describe('ServiceWorkerPlugin', () => {

    beforeEach((done) => {
        return rimraf(webpackOutputPath, done);
    });

    it('should throw if trying to hash the filename', () => {
        expect(() => {
            const swp = new ServiceWorkerPlugin({ filename: 'sw-[hash:7].js' });
        })
        .toThrowError(/The name of the/);
    });

    it('should strip double slashes', (done) => {
        const options = makeWebpackConfig({ filename: '//sw.js' });

        return webpack(options, (err: Error, stats: webpack.Stats) => {
            expect(err).toBeNull();

            const { assetsByChunkName, errors, warnings } = stats.toJson();
            expect(errors).toHaveLength(0);
            expect(warnings).toHaveLength(0);

            const mainFile = fs.readFileSync(
                path.join(webpackOutputPath, assetsByChunkName.main),
                'utf8',
            );

            // expect(mainFile).toMatch('var serviceWorkerOption = {"scriptURL":"/sw.js"}');
            done();
        });
    });

    it('should correctly generate a service worker', (done: any) => {
        const options = makeWebpackConfig({ filename: '//sw.js' });

        return webpack(options, (err, stats) => {
            expect(err).toBeNull();

            const { errors, warnings } = stats.toJson();

            expect(errors).toHaveLength(0);
            expect(warnings).toHaveLength(0);

            const swFile = fs
            .readFileSync(path.join(webpackOutputPath, 'sw.js'), 'utf8')
            .replace(/\s+/g, ' ');

            // sw.js should reference main.js
            expect(swFile).toMatch('var serviceWorkerOption = { "assets": [ "/main.js" ] }');
            // sw.js should include the webpack require code
            expect(swFile).toMatch('function __webpack_require__(moduleId)');

            done();
        });
    });

    it('should allow to have a allow list parameter', (done: any) => {
        const serviceWorkerPlugin = new ServiceWorkerPlugin({ filename, includes: ['bar.*'] });

        const compilation = {
            assets:   {
                [filename]: {
                    source: () => '',
                },
                'bar.js':   {},
                'foo.js':   {},
            },
            getStats: () => ({
                toJson: () => ({}),
            }),
        } as any;

        return serviceWorkerPlugin.handleEmit(
            compilation,
            { options: {} } as any,
            () => {
                expect(compilation.assets[filename].source())
                .toEqual(trim(`
var serviceWorkerOption = {
  "assets": [
    "/bar.js"
  ]
};`));
                done();
            },
        );
    });

    it('should use transformOptions', (done: any) => {
        const transformOptions = (serviceWorkerOption: any) => ({
            bar:       'foo',
            jsonStats: serviceWorkerOption.jsonStats,
        });

        const serviceWorkerPlugin = new ServiceWorkerPlugin({ filename, transformOptions }as any);
        const compilation = {
            assets:   {
                [filename]: {
                    source: () => '',
                },
            },
            getStats: () => ({
                toJson: () => ({
                    foo: 'bar',
                }),
            }),
        } as any;

        return serviceWorkerPlugin.handleEmit(
            compilation,
            { options: {} } as any,
            () => {
                expect(compilation.assets[filename].source())
                .toEqual(trim(`
var serviceWorkerOption = {
  "bar": "foo",
  "jsonStats": {
    "foo": "bar"
  }
};`));
                done();
            },
        );
    });
});
