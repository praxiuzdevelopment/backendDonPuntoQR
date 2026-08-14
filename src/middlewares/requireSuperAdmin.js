/**
 * Middleware para rutas exclusivas del staff de DonPunto.
 *
 * El super admin no se modela como un rol dentro del tenant: es un usuario
 * sin tenant (`tenant_id = null`). Validarlo por esa condición lo mantiene
 * fuera del sistema de permisos por tenant, que sólo aplica a restaurantes.
 */
export const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado',
    });
  }

  const hasNoTenant  = req.user.tenant_id === null || req.user.tenant_id === undefined;
  const isSuperAdmin = req.user.role === 'super_admin';

  if (!hasNoTenant || !isSuperAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Ruta exclusiva del equipo DonPunto',
    });
  }

  next();
};

export default requireSuperAdmin;
