/**
 * Local dependencies
 */
const {JWT} = require('@solid/jose')

const REQUIRED_CLAIMS = ['iss', 'sub', 'aud', 'exp', 'iat']

class TokenClaimsSet {
  /**
   * Claims inherited from JWT:
   * @param iss {string} Issuer URL
   * @param sub {string} Subject identifier
   * @param aud {string|Array<string>} Audience
   * @param exp {number} Expiration (seconds since epoch, RFC3339)
   * @param iat {number} Expiration (seconds since epoch, RFC3339)
   * @param [nbf] {number} Not Before (seconds since epoch, RFC3339)
   * @param [jti] {string} JWT Identifier
   *
   * Claims specific to ID Token:
   * @param [auth_time] {number} Time when user authn occurred (RFC3339)
   * @param [nonce] {string}
   * @param [acr] {string} Authentication Context Class Reference
   * @param [amr] {string} Authentication Methods References
   * @param [azp] {string} Authorized party
   */
  constructor ({ iss, sub, aud, exp, iat, nbf, jti, auth_time, nonce, acr, amr } = {}) {
    this.iss = iss
    this.sub = sub
    this.aud = aud
    this.exp = exp
    this.iat = iat
    this.nbf = nbf
    this.jti = jti
    this.auth_time = auth_time
    this.nonce = nonce
    this.acr = acr
    this.amr = amr
  }

  validate () {
    let valid = true
    let error
    try {
      for (const claim of REQUIRED_CLAIMS) {
        if (!this[claim]) {
          valid = false
          throw new Error(`Required claim ${claim} is missing.`)
        }
      }
    } catch (validationError) {
      error = validationError
    }
    return { valid, error }
  }
}

/**
 * IDToken
 */
class IDToken extends JWT {
  constructor (data = {}) {
    super(data)
    this.payload = new TokenClaimsSet(data.payload)
  }

  validate () {
    const payloadResult = this.payload.validate()
    if (!payloadResult.valid) {
      return payloadResult
    }

    let valid = true
    let error

    return { valid, error }
  }
}

/**
 * Export
 */
module.exports = IDToken
module.exports.TokenClaimsSet = TokenClaimsSet
