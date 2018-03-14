// @flow weak

function registerEvents(registration, callbacks) {
  const sendEvent = event => {
    if (typeof callbacks[event] === 'function') {
      callbacks[event]()
    }
  }

  const handleUpdating = registration2 => {
    const serviceworker = registration2.installing || registration2.waiting
    let ignoreWaiting

    // No SW or already handled
    if (!serviceworker || serviceworker.onstatechange) {
      return
    }

    if (registration2.waiting) {
      ignoreWaiting = true
    }

    function onUpdateStateChange() {
      switch (serviceworker.state) {
        case 'redundant':
          sendEvent('onUpdateFailed')
          serviceworker.onstatechange = null
          break

        case 'installing':
          sendEvent('onUpdating')
          break

        case 'installed':
          if (!ignoreWaiting) {
            sendEvent('onUpdateReady')
          }
          break

        case 'activated':
          sendEvent('onUpdated')
          serviceworker.onstatechange = null
          break

        default:
          break
      }
    }

    function onInstallStateChange() {
      switch (serviceworker.state) {
        case 'redundant':
          // Failed to install, ignore
          serviceworker.onstatechange = null
          break

        case 'activated':
          sendEvent('onInstalled')
          serviceworker.onstatechange = null
          break

        default:
          break
      }
    }

    let stateChangeHandler

    // Already has a SW
    if (registration2.active) {
      onUpdateStateChange()
      stateChangeHandler = onUpdateStateChange
    } else {
      onInstallStateChange()
      stateChangeHandler = onInstallStateChange
    }

    serviceworker.onstatechange = stateChangeHandler
  }

  registration
    .then(registration2 => {
      handleUpdating(registration2)
      registration2.onupdatefound = () => {
        handleUpdating(registration2)
      }
    })
    .catch(err => {
      sendEvent('onError')
      return Promise.reject(err)
    })
}

export default registerEvents
