declare var serviceWorkerOption: any;

export default {
    register(options: any = {}) {
        if (navigator.serviceWorker) {
            return navigator
            .serviceWorker
            .register(serviceWorkerOption.scriptURL, options);
        }

        return false;
    },
};
