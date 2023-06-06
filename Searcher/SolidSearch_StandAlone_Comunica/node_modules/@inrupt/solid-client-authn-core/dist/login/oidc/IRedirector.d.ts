export interface IRedirectorOptions {
    handleRedirect?: (url: string) => unknown;
    redirectByReplacingState?: boolean;
}
export interface IRedirector {
    redirect(redirectUrl: string, redirectorOptions: IRedirectorOptions): void;
}
