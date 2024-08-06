'use strict';

require('jose');
var globals = require('@jest/globals');
require('uuid');

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * @packageDocumentation
 */
/**
 * A helper class that will validate items taken from local storage
 */
// TOTEST: this does not handle all possible bad inputs for example what if it's not proper JSON
/**
 * @hidden
 */
class StorageUtility {
    constructor(secureStorage, insecureStorage) {
        this.secureStorage = secureStorage;
        this.insecureStorage = insecureStorage;
        this.secureStorage = secureStorage;
        this.insecureStorage = insecureStorage;
    }
    getKey(userId) {
        return `solidClientAuthenticationUser:${userId}`;
    }
    async getUserData(userId, secure) {
        const stored = await (secure ? this.secureStorage : this.insecureStorage).get(this.getKey(userId));
        if (stored === undefined) {
            return {};
        }
        try {
            return JSON.parse(stored);
        }
        catch (err) {
            throw new Error(`Data for user [${userId}] in [${secure ? "secure" : "unsecure"}] storage is corrupted - expected valid JSON, but got: ${stored}`);
        }
    }
    async setUserData(userId, data, secure) {
        await (secure ? this.secureStorage : this.insecureStorage).set(this.getKey(userId), JSON.stringify(data));
    }
    async get(key, options) {
        const value = await ((options === null || options === void 0 ? void 0 : options.secure) ? this.secureStorage : this.insecureStorage).get(key);
        if (value === undefined && (options === null || options === void 0 ? void 0 : options.errorIfNull)) {
            throw new Error(`[${key}] is not stored`);
        }
        return value;
    }
    async set(key, value, options) {
        return ((options === null || options === void 0 ? void 0 : options.secure) ? this.secureStorage : this.insecureStorage).set(key, value);
    }
    async delete(key, options) {
        return ((options === null || options === void 0 ? void 0 : options.secure) ? this.secureStorage : this.insecureStorage).delete(key);
    }
    async getForUser(userId, key, options) {
        const userData = await this.getUserData(userId, options === null || options === void 0 ? void 0 : options.secure);
        let value;
        if (!userData || !userData[key]) {
            value = undefined;
        }
        value = userData[key];
        if (value === undefined && (options === null || options === void 0 ? void 0 : options.errorIfNull)) {
            throw new Error(`Field [${key}] for user [${userId}] is not stored`);
        }
        return value || undefined;
    }
    async setForUser(userId, values, options) {
        let userData;
        try {
            userData = await this.getUserData(userId, options === null || options === void 0 ? void 0 : options.secure);
        }
        catch (_a) {
            // if reading the user data throws, the data is corrupted, and we want to write over it
            userData = {};
        }
        await this.setUserData(userId, { ...userData, ...values }, options === null || options === void 0 ? void 0 : options.secure);
    }
    async deleteForUser(userId, key, options) {
        const userData = await this.getUserData(userId, options === null || options === void 0 ? void 0 : options.secure);
        delete userData[key];
        await this.setUserData(userId, userData, options === null || options === void 0 ? void 0 : options.secure);
    }
    async deleteAllUserData(userId, options) {
        await ((options === null || options === void 0 ? void 0 : options.secure) ? this.secureStorage : this.insecureStorage).delete(this.getKey(userId));
    }
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const StorageUtilityGetResponse = "getResponse";
const StorageUtilityMock = {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    get: async (key, options) => StorageUtilityGetResponse,
    set: async (key, value) => {
        /* do nothing */
    },
    delete: async (key) => {
        /* do nothing */
    },
    getForUser: async (userId, key, options) => StorageUtilityGetResponse,
    setForUser: async (userId, values, options) => {
        /* do nothing */
    },
    deleteForUser: async (userId, key, options) => {
        /* do nothing */
    },
    deleteAllUserData: async (userId, options) => {
        /* do nothing */
    },
};
const mockStorage = (stored) => {
    const store = stored;
    return {
        get: async (key) => {
            if (store[key] === undefined) {
                return undefined;
            }
            if (typeof store[key] === "string") {
                return store[key];
            }
            return JSON.stringify(store[key]);
        },
        set: async (key, value) => {
            store[key] = value;
        },
        delete: async (key) => {
            delete store[key];
        },
    };
};
const mockStorageUtility = (stored, isSecure = false) => {
    if (isSecure) {
        return new StorageUtility(mockStorage(stored), mockStorage({}));
    }
    return new StorageUtility(mockStorage({}), mockStorage(stored));
};

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const canHandle = globals.jest.fn((_url) => Promise.resolve(true));
const handle = globals.jest.fn((_url, _emitter) => Promise.resolve({
    sessionId: "global",
    isLoggedIn: true,
    webId: "https://pod.com/profile/card#me",
    fetch: globals.jest.fn(globalThis.fetch),
}));
const mockCanHandleIncomingRedirect = canHandle;
const mockHandleIncomingRedirect = handle;
const mockIncomingRedirectHandler = () => {
    return {
        canHandle,
        handle,
    };
};

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
/**
 * @hidden
 * @packageDocumentation
 */
/**
 * @param sessionId
 * @param storage
 * @hidden
 */
async function clear(sessionId, storage) {
    await Promise.all([
        storage.deleteAllUserData(sessionId, { secure: false }),
        storage.deleteAllUserData(sessionId, { secure: true }),
    ]);
}

//
// Copyright Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
const mockLogoutHandler = (storageUtility) => {
    return {
        canHandle: globals.jest.fn(async (_localUserId) => Promise.resolve(true)),
        handle: globals.jest.fn(async (localUserId) => {
            return clear(localUserId, storageUtility);
        }),
    };
};

exports.StorageUtilityGetResponse = StorageUtilityGetResponse;
exports.StorageUtilityMock = StorageUtilityMock;
exports.mockCanHandleIncomingRedirect = mockCanHandleIncomingRedirect;
exports.mockHandleIncomingRedirect = mockHandleIncomingRedirect;
exports.mockIncomingRedirectHandler = mockIncomingRedirectHandler;
exports.mockLogoutHandler = mockLogoutHandler;
exports.mockStorage = mockStorage;
exports.mockStorageUtility = mockStorageUtility;
