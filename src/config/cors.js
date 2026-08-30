/**
 * Orígenes autorizados a llamar al API.
 *
 * Antes se usaba `cors()` sin opciones, que responde `Access-Control-Allow-Origin: *`
 * a cualquiera: bastaba una página de terceros para consumir el API con las
 * credenciales que el navegador de la víctima ya tuviera a mano.
 *
 * La lista no puede ser fija porque cada restaurante vive en su propio
 * subdominio ({slug}.donpunto.com), así que hay tantos orígenes legítimos como
 * clientes. Por eso se admite el comodín `*.` en el nombre de host:
 *
 *   CORS_ORIGINS=https://donpunto.com,https://*.donpunto.com
 *
 * El comodín cubre exactamente una etiqueta —`polloman.donpunto.com` sí,
 * `a.b.donpunto.com` no—, que es lo que genera el slugify de los restaurantes.
 * Si algún día hicieran falta subdominios anidados, esto falla de forma visible
 * en vez de ensanchar el permiso en silencio.
 */

const stripTrailingSlash = (value) => value.trim().replace(/\/$/, '');

/**
 * Un origen del que sólo interesa protocolo y host, ya normalizados.
 * Devuelve null si no es una URL parseable.
 */
const parseOrigin = (value) => {
  try {
    const url = new URL(stripTrailingSlash(value));
    return { protocol: url.protocol, hostname: url.hostname, port: url.port };
  } catch {
    return null;
  }
};

/**
 * Toda la plataforma es un subdominio por restaurante, así que autorizar
 * FRONTEND_URL sin sus subdominios dejaría fuera a todos los clientes y a la
 * propia consola (app.*). Cuando no hay CORS_ORIGINS explícito, se deriva de
 * FRONTEND_URL el par "dominio + sus subdominios".
 */
const defaultsFromFrontendUrl = () => {
  const frontend = process.env.FRONTEND_URL;
  if (!frontend) return [];

  const parsed = parseOrigin(frontend);
  if (!parsed) return [];

  const port = parsed.port ? `:${parsed.port}` : '';
  return [
    `${parsed.protocol}//${parsed.hostname}${port}`,
    `${parsed.protocol}//*.${parsed.hostname}${port}`,
  ];
};

const parseConfigured = () => {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return defaultsFromFrontendUrl();

  return raw.split(',').map(stripTrailingSlash).filter(Boolean);
};

export const allowedOrigins = parseConfigured();

/** Reglas ya descompuestas, para no volver a parsear en cada petición. */
const rules = allowedOrigins
  .map((entry) => {
    const wildcard = entry.includes('://*.');
    const parsed = parseOrigin(wildcard ? entry.replace('://*.', '://') : entry);
    if (!parsed) return null;

    return { wildcard, protocol: parsed.protocol, hostname: parsed.hostname, port: parsed.port };
  })
  .filter(Boolean);

/**
 * `polloman.donpunto.com` contra la regla `*.donpunto.com`.
 *
 * Se compara sobre el nombre de host ya parseado y exigiendo el punto
 * separador, así que `evil-donpunto.com` y `donpunto.com.evil.com` no cuelan.
 */
const matchesHost = (rule, hostname) => {
  if (!rule.wildcard) return rule.hostname === hostname;

  const suffix = `.${rule.hostname}`;
  if (!hostname.endsWith(suffix)) return false;

  const label = hostname.slice(0, -suffix.length);
  return label.length > 0 && !label.includes('.');
};

export const isAllowedOrigin = (origin) => {
  const parsed = parseOrigin(origin);
  if (!parsed) return false;

  return rules.some(
    (rule) =>
      rule.protocol === parsed.protocol &&
      rule.port === parsed.port &&
      matchesHost(rule, parsed.hostname)
  );
};

export const corsOptions = {
  origin(origin, callback) {
    // Sin cabecera Origin no hay navegador de por medio: peticiones servidor a
    // servidor, curl o las apps móviles. CORS no las protege, así que negarlas
    // aquí no aporta seguridad y sí rompe integraciones.
    if (!origin) return callback(null, true);

    return callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;
