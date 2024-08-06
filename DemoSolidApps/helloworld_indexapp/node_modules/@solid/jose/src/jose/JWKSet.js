'use strict'

/**
 * Dependencies
 */
const JWK = require('./JWK')

/**
 * JWKSet
 *
 * @class
 * JWKSet represents a JSON Web Key Set as described in Section 5 of RFC 7517:
 * https://tools.ietf.org/html/rfc7517#section-5
 */
class JWKSet {
  constructor ({ keys } = {}) {
    this.keys = keys
  }

  /**
   * importKeys
   */
  static async importKeys (jwks) {
    if (!jwks.keys) {
      return Promise.reject(new Error('Cannot import JWKSet: keys property is empty'))
    }

    let imported, importing

    try {
      imported = new JWKSet(jwks)
      importing = jwks.keys.map(key => JWK.importKey(key))
    } catch (err) {
      return Promise.reject(err)
    }

    return Promise.all(importing)
      .then(keys => {
        imported.keys = keys
        return imported
      })
  }
}

/**
 * Export
 */
module.exports = JWKSet
