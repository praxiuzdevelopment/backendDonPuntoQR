export const ROLE_HIERARCHY = {
  super_admin: 1,
  admin: 2,
  viewer: 3,
};

export const requireRole = (minimumRole) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado',
    });
  }

  const userLevel = ROLE_HIERARCHY[req.user.role];
  const requiredLevel = ROLE_HIERARCHY[minimumRole];

  if (!userLevel || !requiredLevel) {
    return res.status(403).json({
      success: false,
      message: 'Rol no reconocido',
    });
  }

  if (userLevel > requiredLevel) {
    return res.status(403).json({
      success: false,
      message: `Acceso denegado. Se requiere rol: ${minimumRole}`,
    });
  }

  next();
};
