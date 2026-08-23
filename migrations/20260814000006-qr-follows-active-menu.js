import { DataTypes } from 'sequelize';

/**
 * Modo de resolución de un código QR y regla de un QR por menú.
 *
 * `follows_active_menu` decide si el código sirve siempre su menú (modo fijo) o
 * si sigue lo que esté vigente en la sede: la temporada si está en fechas y el
 * menú principal si no. Así una carta de temporada entra y sale sola sin
 * reimprimir nada.
 *
 * El índice único cumple la otra mitad de la regla: un menú no puede tener dos
 * códigos QR.
 */
export default {
  async up(queryInterface) {
    await queryInterface.addColumn('qr_code', 'follows_active_menu', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'true: sirve el menú vigente de la sede; false: siempre su menú',
    });

    // Los códigos que ya apuntan al menú principal son los de mesa: deben
    // seguir la temporada cuando la haya.
    await queryInterface.sequelize.query(`
      UPDATE qr_code SET follows_active_menu = true
      WHERE menu_id IN (SELECT menu_id FROM menu WHERE is_default = true);
    `);

    // Antes del índice único hay que quedarse con un solo QR por menú: se
    // conserva el más antiguo, que es el que puede estar impreso.
    await queryInterface.sequelize.query(`
      DELETE FROM qr_code
      WHERE menu_id IS NOT NULL
        AND qr_code_id NOT IN (
          SELECT DISTINCT ON (menu_id) qr_code_id
          FROM qr_code
          WHERE menu_id IS NOT NULL
          ORDER BY menu_id, created_at ASC, qr_code_id ASC
        );
    `);

    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX qr_code_one_per_menu
      ON qr_code (menu_id) WHERE menu_id IS NOT NULL;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS qr_code_one_per_menu;');
    await queryInterface.removeColumn('qr_code', 'follows_active_menu');
  },
};
