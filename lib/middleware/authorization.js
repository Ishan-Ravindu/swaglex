const authorize = requiredRole => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  if (requiredRole && req.user.role !== requiredRole && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  next()
}

module.exports = authorize
