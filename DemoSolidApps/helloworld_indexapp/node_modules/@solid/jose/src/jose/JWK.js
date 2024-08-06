'use strict'

/**
 * Dependencies
 * @ignore
 */
const JWA = require('./JWA')

/**
 * JWK Class
 */
class JWK {
  constructor ({ kty, use, key_ops, alg, kid, x5u, x5c, x5t } = {}) {
    this.kty = kty
    this.use = use
    this.key_ops = key_ops
    this.alg = alg
    this.kid = kid
    this.x5u = x5u
    this.x5c = x5c
    this.x5t = x5t
  }

  /**
   * importKey
   *
   * TODO:
   * - should this be on JWA?
   */
  static async importKey (jwk) {
    return JWA.importKey(jwk)
  }


}

/**
 * Export
 */
module.exports = JWK
