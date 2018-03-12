# serviceworker-webpack-plugin

> Simplifies creation of a service worker to serve your webpack bundles.

[![npm version](https://img.shields.io/npm/v/serviceworker-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/serviceworker-webpack-plugin)
[![npm downloads](https://img.shields.io/npm/dm/serviceworker-webpack-plugin.svg?style=flat-square)](https://www.npmjs.com/package/serviceworker-webpack-plugin)
[![Build Status](https://travis-ci.org/oliviertassinari/serviceworker-webpack-plugin.svg?branch=master)](https://travis-ci.org/oliviertassinari/serviceworker-webpack-plugin)

[![Dependencies](https://img.shields.io/david/oliviertassinari/serviceworker-webpack-plugin.svg?style=flat-square)](https://david-dm.org/oliviertassinari/serviceworker-webpack-plugin)
[![DevDependencies](https://img.shields.io/david/dev/oliviertassinari/serviceworker-webpack-plugin.svg?style=flat-square)](https://david-dm.org/oliviertassinari/serviceworker-webpack-plugin#info=devDependencies&view=list)

## Installation

```sh
npm install serviceworker-webpack-plugin
```

## The problem solved

When building a service worker, you probably want to [cache all](https://github.com/oliviertassinari/serviceworker-webpack-plugin/blob/master/docs/src/sw.js#L38)
your assets during the `install` phase.
But in order to do so, you need their **names**.
That's not simple when you are using *Webpack*:
- The assets names are *non-deterministic* when taking advantage of the long term caching.
- The assets list can even evolve over time as you add splitting points or more resources.
- You want to be able to use your service worker with the **dev-server** mode of Webpack.
- You want to keep the build process as simple as possible.

## Setup

### 1. Add the plugin to your webpack config

```js
import ServiceWorkerWebpackPlugin from 'serviceworker-webpack-plugin';

...

  plugins: [
    new ServiceWorkerWebpackPlugin({
      entry: path.join(__dirname, 'src/sw.js'),
    }),
  ],

```

### 2. Register the service worker in your main JS thread

```js
import runtime from 'serviceworker-webpack-plugin/lib/runtime';

if ('serviceWorker' in navigator) {
  const registration = runtime.register();
}
```

### 3. Write your own `sw.js`

You can now use the global `serviceWorkerOption` variable in your `sw.js`.
E.g. In our example this object looks like:
```js
{
  assets: [
    './main.256334452761ef349e91.js',
  ],
}
```

## Simple example

You can have a look at the [`/docs`](https://github.com/oliviertassinari/serviceworker-webpack-plugin/tree/master/docs)
folder if you need a full working example.

## API

### `ServiceWorkerWebpackPlugin(options)`

- `options`
 - `entry`, **required**, *string*:
Path to the actual service worker implementation.
 - `filename`, *string*, default `'sw.js'`:
Relative (from the webpack's config `output.path`) output path for emitted script.
 - `excludes`, *array*, default `['**/.*', '**/*.map']`:
Exclude matched assets from being added to the `serviceWorkerOption.assets` variable. (Blacklist)
 - `includes`, *array*, default `['**/*']`:
Include matched assets added to the `serviceWorkerOption.assets` variable. (Whitelist)
 - `publicPath`, *string*, default `'/'`:
Specifies the public URL address of the output files when referenced in a browser.
We use this value to load the service worker over the network.
 - `template`, *function*, default noop:
This callback function can be used to inject statically generated service worker.
It's taking a `serviceWorkerOption` argument and must return a promise.
- `transformOptions`, *function*:
This callback function receives a raw `serviceWorkerOption` argument.
The `jsonStats` key contains all the webpack build information.
- `minimize`:
Whether to minimize output. Defaults to `process.env.NODE_ENV === 'production'`

### `runtime(options)`

- `options`: That's forwarded to the `options` argument of the
[`ServiceWorkerContainer.register()`](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register) function.

## Credit

- The [offline-plugin](https://github.com/NekR/offline-plugin) package
was a great source of inspiration.
- The [html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin)
package was also really helpful.

## Why simply not use the `offline-plugin`?

I wouldn't have been able to write this plugin without the [offline-plugin](https://github.com/NekR/offline-plugin) project.
Thanks [@NekR](https://github.com/NekR/offline-plugin) for sharing it!

Still, soon after using it, I realized that it wasn't what I was looking for.
 - The *abstraction* provided was **too high**.
 (I needed to build some custom fetch logic.)
 - It was making me, even more, **dependent** on Webpack.
 (What if later, I want to switch to another build system?)

Hence, I decided to change the approach and created this **thin layer** on
top of Webpack to solve the assets name issue. Nothing more.

If you don't care about my two issues with `offline-plugin`
then you don't need to use this package, `offline-plugin` is great.

## The specs

- [Service Workers](https://w3c.github.io/ServiceWorker/)

## License

MIT
