const ROLES = ['admin', 'clinician', 'receptionist'];

function requireRoles(...allowed) {
  const set = new Set(allowed);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!set.has(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  return requireRoles('admin')(req, res, next);
}

/** Admin or clinician — not receptionist */
function requireClinical(req, res, next) {
  return requireRoles('admin', 'clinician')(req, res, next);
}

module.exports = { requireRoles, requireAdmin, requireClinical, ROLES };
