class AppError extends Error {
  /**
   * @param {string} message  Mensaje legible para el usuario.
   * @param {number} status   Código HTTP.
   * @param {object} [options]
   * @param {string} [options.code]     Código estable para que el cliente
   *                                    distinga el caso sin parsear el mensaje.
   * @param {object} [options.details]  Datos extra para pintar el error.
   */
  constructor(message, status, options = {}) {
    super(message);
    this.status = status;
    this.code = options.code;
    this.details = options.details;
    this.isOperational = true; // Identifies known errors
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
