import jwt from 'jsonwebtoken';

/**
 * Middleware para validar el JWT.
 * Inyecta los datos del payload en req.user
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token no provisto o formato inválido',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'El token ha expirado' });
    }
    return res.status(401).json({ success: false, message: 'Token inválido' });
  }
};
