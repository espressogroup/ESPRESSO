'use strict'

/**
 * Dependencies
 * @ignore
 */
const base64url = require('base64url')
const crypto = require('isomorphic-webcrypto')
const TextEncoder = require('../text-encoder')

/**
 * ECDSA with SHA-2 Functions and P Curves
 */
class ECDSA {

  /**
   * Constructor
   *
   * @param {string} bitlength
   */
  constructor (params) {
    this.params = params
  }

  /**
   * Sign
   *
   * @description
   * Generate a hash-based message authentication code for a
   * given input and key. Enforce the key length is equal to
   * or greater than the bitlength.
   *
   * @param {CryptoKey} key
   * @param {string} data
   *
   * @returns {string}
   */
  sign (key, data) {
    let algorithm = this.params

    // TODO: validate key length

    data = new TextEncoder().encode(data)

    return crypto.subtle
      .sign(algorithm, key, data)
      .then(signature => base64url(Buffer.from(signature)))
  }

  /**
   * Verify
   *
   * @description
   * Verify a digital signature for a given input and private key.
   *
   * @param {CryptoKey} key
   * @param {string} signature
   * @param {string} data
   *
   * @returns {Boolean}
   */
  verify (key, signature, data) {
    let algorithm = this.params

    if (typeof signature === 'string') {
      signature = Uint8Array.from(base64url.toBuffer(signature))
    }

    if (typeof data === 'string') {
      data = new TextEncoder().encode(data)
    }

    return crypto.subtle.verify(algorithm, key, signature, data)
  }

  /**
   * Assert Sufficient Key Length
   *
   * @description Assert that the key length is sufficient
   * @param {string} key
   */
  assertSufficientKeyLength (key) {
    if (key.length < this.bitlength) {
      throw new Error('The key is too short.')
    }
  }

  /**
   * importKey
   * copied from ./RSASSA-PKCS1-v1_5.js, and it works!
   *
   * @param {JWK} key
   * @returns {Promise}
   */
  async importKey (key) {
    let jwk = Object.assign({}, key)
    let algorithm = this.params
    let usages = key['key_ops'] || []

    if (key.use === 'sig') {
      usages.push('verify')
    }

    if (key.use === 'enc') {
      // TODO: handle encryption keys
      return Promise.resolve(key)
    }

    if (key.key_ops) {
      usages = key.key_ops
    }

    return crypto.subtle
      .importKey('jwk', jwk, algorithm, true, usages)
      .then(cryptoKey => {
        Object.defineProperty(jwk, 'cryptoKey', {
          enumerable: false,
          value: cryptoKey
        })

        return jwk
      })
  }
}

/**
 * Export
 */
module.exports = ECDSA
