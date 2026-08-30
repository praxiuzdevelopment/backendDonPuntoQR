import rateLimit from 'express-rate-limit';

/**
 * Límites de peticiones por IP.
 *
 * Los tres puntos que se protegen tienen amenazas distintas, así que no
 * comparten cifra: adivinar contraseñas, crear restaurantes basura y copiar el
 * catálogo y los precios de todos los clientes.
 *
 * Sobre el conteo por IP: en un restaurante todos los comensales salen por la
 * misma IP del wifi, y muchos móviles comparten salida en la red del operador.
 * Por eso el límite público es holgado —está para frenar un raspado sistemático,
 * no para racionar mesas— mientras que los de autenticación, donde cada
 * petición es un intento deliberado, son estrictos.
 */

const message = (text) => ({
  success: false,
  code: 'RATE_LIMITED',
  message: text,
});

/** Respuesta común: 429 con el mismo contrato que el resto del API. */
const handler = (text) => (req, res) => res.status(429).json(message(text));

/**
 * Login: 10 intentos por IP cada 15 minutos.
 * Los aciertos no cuentan, así que un local con mucho personal entrando a la
 * vez no se autobloquea; sólo se penaliza el fallo repetido.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Demasiados intentos de acceso. Espera unos minutos y vuelve a intentarlo.'),
});

/** Registro: 5 restaurantes por IP y hora. Alta legítima es un hecho raro. */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Demasiados registros desde esta conexión. Inténtalo más tarde.'),
});

/** Carta pública: 200 cargas por IP cada 5 minutos. */
export const publicMenuLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: handler('Demasiadas peticiones. Espera un momento y recarga la carta.'),
});

export default { loginLimiter, registerLimiter, publicMenuLimiter };
