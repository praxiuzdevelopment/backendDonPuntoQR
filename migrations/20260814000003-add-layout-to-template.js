import { DataTypes } from 'sequelize';

/**
 * La plantilla deja de ser sólo un nombre y pasa a describir su propia
 * composición.
 *
 * `layout` guarda qué bloques la forman, en qué orden y con qué opciones. Un
 * único renderizador en el frontend la interpreta, de modo que crear una
 * plantilla nueva es escribir esta especificación y no un componente.
 * Es también la estructura que editará el constructor de plantillas.
 */
export default {
  async up(queryInterface) {
    await queryInterface.addColumn('template', 'layout', {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('template', 'layout');
  },
};
