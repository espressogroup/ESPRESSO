/**
 * @hidden
 */
export interface ITokenRequester {
    request(localUserId: string, body: Record<string, string>): Promise<void>;
}
/**
 * @hidden
 */
export default class TokenRequester {
    request(_sessionId: string, _body: Record<string, string>): Promise<void>;
}
