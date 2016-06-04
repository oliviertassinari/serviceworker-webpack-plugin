/* eslint-disable no-console */

import runtime from '../../src/runtime';
import registerEvents from '../../src/browser/registerEvents';

if ('serviceWorker' in navigator && (window.location.protocol === 'https:' ||
  window.location.hostname === 'localhost')
) {
  const registration = runtime.register({
    scope: '/', // Use the root.
  });

  registerEvents(registration, {
    onInstalled: () => {
      console.log('onInstalled');
    },
    onUpdateReady: () => {
      console.log('onUpdateReady');
    },
    onUpdating: () => {
      console.log('onUpdating');
    },
    onUpdateFailed: () => {
      console.log('onUpdateFailed');
    },
    onUpdated: () => {
      console.log('onUpdated');
    },
  });
} else {
  console.log('serviceWorker not available');
}

console.log('JS loader');
