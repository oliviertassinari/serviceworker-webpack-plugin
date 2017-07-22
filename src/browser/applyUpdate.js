// @flow weak

function applyUpdate() {
  return new Promise((resolve, reject) => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (!registration || !registration.waiting) {
          reject()
          return
        }

        registration.waiting.postMessage({
          action: 'skipWaiting',
        })

        resolve()
      })
    } else {
      reject()
    }
  })
}

export default applyUpdate
