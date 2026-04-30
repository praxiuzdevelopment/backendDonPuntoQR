
/**
 * Middleware para validar el body, query o params de una petición usando Joi.
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      const details = error.details.map((d) => d.message).join(', ');
      return res.status(422).json({
        success: false,
        message: 'Error de validación',
        details,
      });
    }
    next();
  };
};

/**
 * Helper para convertir booleanos string ('true', 'false') a boolean
 * o numbers string a Number, útil en parseo de query params o formData.
 */
export const parseState = (value) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};
