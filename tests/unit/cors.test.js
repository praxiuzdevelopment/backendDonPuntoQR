import { jest } from '@jest/globals';

/**
 * La configuración se lee al importar el módulo, así que cada escenario necesita
 * su propio registro de módulos.
 */
const loadWith = async (env) => {
  jest.resetModules();
  delete process.env.CORS_ORIGINS;
  delete process.env.FRONTEND_URL;
  Object.assign(process.env, env);
  return import('../../src/config/cors.js');
};

describe('CORS con subdominio por restaurante', () => {
  describe('derivado de FRONTEND_URL', () => {
    it('autoriza el dominio y sus subdominios', async () => {
      const { allowedOrigins, isAllowedOrigin } = await loadWith({
        FRONTEND_URL: 'http://localhost:3001',
      });

      expect(allowedOrigins).toEqual(['http://localhost:3001', 'http://*.localhost:3001']);
      expect(isAllowedOrigin('http://localhost:3001')).toBe(true);
      expect(isAllowedOrigin('http://app.localhost:3001')).toBe(true);
      expect(isAllowedOrigin('http://polloman.localhost:3001')).toBe(true);
    });

    it('no cruza puertos ni protocolos', async () => {
      const { isAllowedOrigin } = await loadWith({ FRONTEND_URL: 'http://localhost:3001' });

      expect(isAllowedOrigin('http://app.localhost:3000')).toBe(false);
      expect(isAllowedOrigin('https://app.localhost:3001')).toBe(false);
    });
  });

  describe('lista explícita con comodín', () => {
    const env = { CORS_ORIGINS: 'https://donpunto.com,https://*.donpunto.com' };

    it('autoriza la raíz y un subdominio cualquiera', async () => {
      const { isAllowedOrigin } = await loadWith(env);

      expect(isAllowedOrigin('https://donpunto.com')).toBe(true);
      expect(isAllowedOrigin('https://app.donpunto.com')).toBe(true);
      expect(isAllowedOrigin('https://polloman.donpunto.com')).toBe(true);
    });

    it('rechaza los dominios que sólo se le parecen', async () => {
      const { isAllowedOrigin } = await loadWith(env);

      // Sin el punto separador no es un subdominio, es otro dominio.
      expect(isAllowedOrigin('https://evil-donpunto.com')).toBe(false);
      // El dominio autorizado como prefijo de otro tampoco cuenta.
      expect(isAllowedOrigin('https://donpunto.com.evil.com')).toBe(false);
      expect(isAllowedOrigin('https://evil.com')).toBe(false);
    });

    it('el comodín cubre una etiqueta, no subdominios anidados', async () => {
      const { isAllowedOrigin } = await loadWith(env);

      expect(isAllowedOrigin('https://a.b.donpunto.com')).toBe(false);
      expect(isAllowedOrigin('https://.donpunto.com')).toBe(false);
    });

    it('ignora la barra final y los espacios', async () => {
      const { isAllowedOrigin } = await loadWith({
        CORS_ORIGINS: ' https://donpunto.com/ , https://*.donpunto.com/ ',
      });

      expect(isAllowedOrigin('https://donpunto.com')).toBe(true);
      expect(isAllowedOrigin('https://app.donpunto.com')).toBe(true);
    });
  });

  describe('peticiones sin cabecera Origin', () => {
    it('se dejan pasar: no hay navegador al que proteger', async () => {
      const { corsOptions } = await loadWith({ FRONTEND_URL: 'http://localhost:3001' });

      const allowed = await new Promise((resolve) =>
        corsOptions.origin(undefined, (_err, ok) => resolve(ok))
      );

      expect(allowed).toBe(true);
    });
  });

  describe('sin configuración alguna', () => {
    it('no autoriza a nadie en vez de abrirse a todos', async () => {
      const { allowedOrigins, isAllowedOrigin } = await loadWith({});

      expect(allowedOrigins).toEqual([]);
      expect(isAllowedOrigin('https://donpunto.com')).toBe(false);
    });
  });
});
