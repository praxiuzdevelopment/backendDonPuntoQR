import { DataTypes } from 'sequelize';

/**
 * Concepto de "menú principal".
 *
 * Hasta ahora, cuando un código QR no resolvía un menú concreto, el menú
 * público servía "el menú activo más reciente" — un criterio arbitrario que
 * hacía que la carta cambiara sola al crear otra.
 *
 * `menu.is_default` marca cuál es la carta de siempre del restaurante y
 * `branch.main_menu_id` permite que una sede la sobrescriba. Un restaurante de
 * una sola sede no configura nada: le basta el principal del restaurante.
 */
export default {
  async up(queryInterface) {
    await queryInterface.addColumn('menu', 'is_default', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    // El menú más antiguo de cada restaurante pasa a ser el principal: es el
    // que sus códigos QR ya estaban sirviendo de hecho.
    await queryInterface.sequelize.query(`
      UPDATE menu SET is_default = true
      WHERE menu_id IN (
        SELECT DISTINCT ON (tenant_id) menu_id
        FROM menu
        WHERE active = true
        ORDER BY tenant_id, created_at ASC, menu_id ASC
      );
    `);

    // Como máximo un principal por restaurante.
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX menu_one_default_per_tenant
      ON menu (tenant_id) WHERE is_default = true;
    `);

    await queryInterface.addColumn('branch', 'main_menu_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'menu', key: 'menu_id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Sobrescribe el menú principal del restaurante para esta sede',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('branch', 'main_menu_id');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS menu_one_default_per_tenant;');
    await queryInterface.removeColumn('menu', 'is_default');
  },
};
