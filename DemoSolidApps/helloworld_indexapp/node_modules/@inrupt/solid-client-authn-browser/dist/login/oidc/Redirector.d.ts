/**
 * @hidden
 * @packageDocumentation
 */
import type { IRedirector, IRedirectorOptions } from "@inrupt/solid-client-authn-core";
/**
 * @hidden
 */
export default class Redirector implements IRedirector {
    redirect(redirectUrl: string, options?: IRedirectorOptions): void;
}
