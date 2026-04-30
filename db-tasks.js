import 'dotenv/config';
import { Umzug, SequelizeStorage } from 'umzug';
import { pathToFileURL } from 'node:url';
import { sequelize } from './src/models/index.js';

// Configuración base para el cargador de ESM
const esmResolver = (folder) => ({
  glob: `${folder}/*.js`,
  resolve: ({ name, path: filePath, context }) => {
    const getModule = () => import(pathToFileURL(filePath));
    return {
      name,
      up: async () => (await getModule()).default.up(context, sequelize.constructor),
      down: async () => (await getModule()).default.down(context, sequelize.constructor),
    };
  },
});

// Instancia para Migraciones (Tabla: SequelizeMeta)
const migrator = new Umzug({
  migrations: esmResolver('migrations'),
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: 'SequelizeMeta' }),
  logger: console,
});

// Instancia para Seeders (Tabla: SequelizeData)
const seeder = new Umzug({
  migrations: esmResolver('seeders'),
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, modelName: 'SequelizeData' }),
  logger: console,
});

// Lógica de ejecución basada en argumentos
const run = async () => {
  const task = process.argv[2];
  const action = process.argv[3] || 'up';

  try {
    if (task === 'migrate') {
      action === 'up' ? await migrator.up() : await migrator.down();
    } else if (task === 'seed') {
      action === 'up' ? await seeder.up() : await seeder.down();
    } else {
      console.log('Uso: node db-tasks.js [migrate|seed] [up|down]');
    }
  } catch (err) {
    console.error('❌ Error ejecutando tarea db-tasks:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

run();
