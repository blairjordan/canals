const { expressjwt: jwt } = require("express-jwt")
const jwksRsa = require("jwks-rsa")

const checkJwt =
  ({ issuer, audience, debug = false }) =>
  (req, res, next) => {
    if (debug) {
      console.info("Headers:", req.headers)
    }

    // Skip JWT verification for WebSocket connections
    if (
      req.headers.upgrade &&
      req.headers.upgrade.toLowerCase() === "websocket"
    ) {
      return next()
    }

    return jwt({
      secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${issuer}/.well-known/jwks.json`,
      }),
      issuer: `https://${issuer}/`,
      audience,
      algorithms: ["RS256"],
    })(req, res, next)
  }

module.exports = { checkJwt }
