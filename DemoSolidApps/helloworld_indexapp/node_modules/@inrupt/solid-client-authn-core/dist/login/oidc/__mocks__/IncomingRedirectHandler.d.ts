/// <reference types="node" />
import type { EventEmitter } from "events";
import type IIncomingRedirectHandler from "../IIncomingRedirectHandler";
export declare const mockCanHandleIncomingRedirect: import("jest-mock").Mock<(_url: string) => Promise<boolean>>;
export declare const mockHandleIncomingRedirect: import("jest-mock").Mock<(_url: string, _emitter: EventEmitter | undefined) => Promise<{
    sessionId: string;
    isLoggedIn: boolean;
    webId: string;
    fetch: import("jest-mock").Mock<typeof fetch>;
}>>;
export declare const mockIncomingRedirectHandler: () => IIncomingRedirectHandler;
