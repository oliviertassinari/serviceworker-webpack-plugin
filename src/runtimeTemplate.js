/* global serviceWorkerOption */

export default {
  register(options = {}) {
    return navigator.serviceWorker
      .register(serviceWorkerOption.scriptURL, options);
  },
};
