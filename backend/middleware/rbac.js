export const roles = {
  ADMIN: 'admin',
  Leader: 'Leader',
  EMPLOYEE: 'employee',
}

export const PERMANENT_ADMIN_EMAIL = 'coo.kishorcoder@gmail.com'

export const isPermanentAdmin = (email) => {
  if (!email || typeof email !== 'string') return false
  return email.trim().toLowerCase() === PERMANENT_ADMIN_EMAIL.toLowerCase()
}

export const ensureRole = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role
  if (!role) {
    return res.status(403).json({ error: 'Role claim missing from token' })
  }
  const normalizedRole = role.toLowerCase()
  const normalizedAllowed = allowedRoles.map(r => r.toLowerCase())
  if (!normalizedAllowed.includes(normalizedRole)) {
    return res.status(403).json({ error: 'Insufficient privileges' })
  }
  next()
}

export const requireAdmin = ensureRole(roles.ADMIN)
export const requireLeader = ensureRole(roles.ADMIN, roles.Leader)
export const requireEmployee = ensureRole(roles.ADMIN, roles.Leader, roles.EMPLOYEE)
