import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MenuQR API — DonPunto',
      version: '1.0.0',
      description: `
API REST multi-tenant para la plataforma MenuQR (DonPunto).
Permite a restaurantes digitalizar sus menús con códigos QR.

**Autenticación**: \`Authorization: Bearer <token>\`

**Multi-tenant**: El \`tenant_id\` nunca va en el body — siempre se extrae del JWT.
      `,
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}`, description: 'Desarrollo local' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Mensaje de error' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
