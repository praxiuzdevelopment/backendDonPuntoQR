import { DataTypes } from 'sequelize';

/**
 * Alcance de sede para los menús.
 *
 * Hasta ahora un menú de temporada valía para todo el restaurante, así que una
 * promoción pensada para una sola sucursal se mostraba en todas y además tapaba
 * el `main_menu_id` que cada sede tuviera configurado.
 *
 * `branch_id` nulo significa "todas las sedes", que es como se comportaban los
 * menús existentes: la columna nace en NULL y nada cambia para quien ya opera.
 *
 * ON DELETE SET NULL a propósito: si se borra la sucursal preferimos que su
 * menú pase a ser del restaurante antes que perderlo junto con la sede.
 */
export default {
  async up(queryInterface) {
    await queryInterface.addColumn('menu', 'branch_id', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'branch', key: 'branch_id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Sede a la que pertenece el menú. Null = todas las sedes',
    });

    // El resolvedor filtra por estas tres columnas en cada carga de menú
    // público, que es la ruta más caliente del sistema.
    await queryInterface.addIndex('menu', ['tenant_id', 'branch_id', 'temporal'], {
      name: 'menu_tenant_branch_temporal_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('menu', 'menu_tenant_branch_temporal_idx');
    await queryInterface.removeColumn('menu', 'branch_id');
  },
};
