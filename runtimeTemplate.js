export default {
  register(options = {}) {
    return navigator.serviceWorker
      .register(<%- JSON.stringify(output) %>, options);
  }
};
