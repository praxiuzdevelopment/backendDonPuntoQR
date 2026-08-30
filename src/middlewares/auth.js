import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';

/**
 * Middleware para validar el JWT.
 * Inyecta los datos del payload en req.user
 *
 * Verificar la firma no basta: el token vive horas y sigue siendo válido
 * aunque entretanto se desactive al usuario o se le cambie el rol. Sin
 * releer la cuenta, dar de baja a un empleado no le quitaba el acceso hasta
 * que expirara su sesión —inaceptable en cuanto haya caja de por medio—.
 *
 * Por eso el rol y el restaurante se toman de la base de datos y no del
 * token: el payload dice quién dijo ser al entrar, la tabla dice qué puede
 * hacer ahora.
 */
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no provisto o formato inválido',
    });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'El token ha expirado' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }

  try {
    const user = await User.findByPk(decoded.user_id, {
      attributes: ['user_id', 'tenant_id', 'role_id', 'email', 'active'],
      include: [{ model: Role, as: 'role', attributes: ['name', 'active'] }],
    });

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: 'La cuenta no está activa',
      });
    }

    if (!user.role || !user.role.active) {
      return res.status(403).json({
        success: false,
        code: 'ROLE_INACTIVE',
        message: 'El rol de la cuenta ya no está disponible',
      });
    }

    req.user = {
      user_id:   user.user_id,
      tenant_id: user.tenant_id,
      role_id:   user.role_id,
      role:      user.role.name,
      email:     user.email,
    };

    return next();
  } catch (error) {
    console.error('[authenticate]', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export default { authenticate };
