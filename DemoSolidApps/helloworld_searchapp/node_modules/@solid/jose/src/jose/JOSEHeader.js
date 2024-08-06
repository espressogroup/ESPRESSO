/**
 * Header
 */
class JOSEHeader {
  constructor ({ typ, cty, alg, jku, kid, x5u, x5c, x5t, crit, enc, zip } = {}) {
    this.typ = typ
    this.cty = cty
    this.alg = alg
    this.jku = jku
    this.kid = kid
    this.x5u = x5u
    this.x5c = x5c
    this.x5t = x5t
    this.crit = crit
    this.enc = enc
    this.zip = zip
  }

  /**
   * isJWS
   */
  isJWS () {}

  /**
   * isJWE
   */
  isJWE () {}
}

/**
 * Export
 */
module.exports = JOSEHeader
