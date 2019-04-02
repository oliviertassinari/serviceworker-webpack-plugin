declare class Runtime {
    public register(): Promise<ServiceWorkerRegistration>;
}

declare const serviceworker: Runtime;
export default serviceworker;
