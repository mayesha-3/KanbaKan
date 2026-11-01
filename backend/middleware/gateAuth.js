import { verifyGateToken } from '../utils/security.js'

export const verifyGateTokenHeader = (req, res, next) => {
  // If the request contains an authenticated Bearer token, bypass gate challenge
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next()
  }

  const gateToken = req.headers['x-gate-token']
  if (!gateToken) {
    return res.status(403).json({ error: 'Security gate verification token missing. Please pass the security challenge.' })
  }

  const isValid = verifyGateToken(gateToken)
  if (!isValid) {
    return res.status(403).json({ error: 'Security gate verification token expired or invalid. Please re-verify.' })
  }

  next()
}
