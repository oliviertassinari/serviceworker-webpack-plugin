function applyUpdate() {
  return new Promise((resolve: any, reject: any) => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then((registration: any) => {
        if (!registration || !registration.waiting) {
          reject();
          return;
        }

        registration.waiting.postMessage({
          action: 'skipWaiting',
        });

        resolve();
      });
    } else {
      reject();
    }
  });
}

export default applyUpdate;
