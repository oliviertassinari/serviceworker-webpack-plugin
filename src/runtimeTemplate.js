/* global serviceWorkerOption */

export default {
  register(options = {}) {
    return navigator.serviceWorker
      .register(serviceWorkerOption.output, options);
  },
};
