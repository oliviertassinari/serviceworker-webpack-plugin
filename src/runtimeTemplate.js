/* eslint-disable flowtype/require-valid-file-annotation */
/* global serviceWorkerOption */

export default {
  register(options = {}) {
    if (navigator.serviceWorker) {
      return navigator.serviceWorker.register(serviceWorkerOption.scriptURL, options)
    }

    return false
  },
}
