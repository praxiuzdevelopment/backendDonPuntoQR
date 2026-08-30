import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import corsOptions, { allowedOrigins } from './config/cors.js';
import routes from './routes/index.js';
import { sequelize } from './models/index.js';

const app  = express();
const PORT = process.env.PORT || 3000;

// Detrás de un proxy inverso, `req.ip` es la IP del proxy: sin esto todos los
// clientes comparten cubo y el límite de peticiones castiga a quien no debe.
// Se declara explícito porque confiar en cabeceras que el cliente puede falsear
// sin tener proxy delante permitiría saltarse ese mismo límite.
if (process.env.TRUST_PROXY) {
  const value = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isNaN(value) ? process.env.TRUST_PROXY : value);
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// La documentación describe la superficie completa del API. Fuera de desarrollo
// se publica sólo si alguien lo pide a propósito.
const docsEnabled = process.env.ENABLE_API_DOCS === 'true' || process.env.NODE_ENV !== 'production';

if (docsEnabled) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'MenuQR API — DonPunto',
    swaggerOptions: { persistAuthorization: true },
  }));

  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

app.use(routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV, timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error('[app] error no manejado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida');

    if (allowedOrigins.length === 0) {
      console.warn('⚠️  CORS sin orígenes autorizados: define CORS_ORIGINS o FRONTEND_URL');
    } else {
      console.log(`🔒 CORS autorizado para: ${allowedOrigins.join(', ')}`);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      if (docsEnabled) {
        console.log(`📚 Swagger UI: http://localhost:${PORT}/api/docs`);
        console.log(`📦 Postman spec: http://localhost:${PORT}/api/docs.json`);
      }
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    process.exit(1);
  }
};

start();

export default app;
