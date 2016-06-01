/* global swOptions */

export default {
  register(options = {}) {
    return navigator.serviceWorker
      .register(swOptions.output, options);
  },
};
