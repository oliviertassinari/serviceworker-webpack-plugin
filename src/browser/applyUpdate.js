// @flow weak

function applyUpdate() {
  return new Promise((resolve, reject) => {
    navigator.serviceWorker.getRegistration()
      .then((registration) => {
        if (!registration || !registration.waiting) {
          reject();
          return;
        }

        registration.waiting.postMessage({
          action: 'skipWaiting',
        });

        resolve();
      });
  });
}

export default applyUpdate;
