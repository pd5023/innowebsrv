const { can } = require('./policy');

function requirePermission(resource, action) {
  return (req, res, next) => {
    const role = req.auth?.role;
    if (!role || !can(role, resource, action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

module.exports = requirePermission;
