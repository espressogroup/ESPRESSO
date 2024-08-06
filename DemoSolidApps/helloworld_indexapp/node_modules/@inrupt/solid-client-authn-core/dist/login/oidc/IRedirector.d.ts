/**
 * @hidden
 * @packageDocumentation
 */
/**
 * @hidden
 */
export interface IRedirectorOptions {
    handleRedirect?: (url: string) => unknown;
    redirectByReplacingState?: boolean;
}
/**
 * @hidden
 */
export interface IRedirector {
    redirect(redirectUrl: string, redirectorOptions: IRedirectorOptions): void;
}
