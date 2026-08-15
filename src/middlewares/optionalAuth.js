import jwt from 'jsonwebtoken';

/**
 * Autenticación opcional.
 *
 * Para endpoints que sirven a todos pero devuelven más información a quien se
 * identifica: el listado de ciudades es público (alimenta el selector de
 * sucursales), pero el staff de DonPunto necesita ver también las inactivas.
 *
 * Un token inválido no corta la petición: simplemente sigue como anónimo.
 */
export const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    // Anónimo.
  }

  return next();
};

export default optionalAuthenticate;
