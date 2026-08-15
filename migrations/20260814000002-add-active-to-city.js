import { DataTypes } from 'sequelize';

/**
 * Las ciudades no se borran: se deshabilitan.
 *
 * `branch.city_id` apunta a esta tabla, así que un DELETE rompería las
 * sucursales existentes. Con `active` se saca del selector sin tocar los
 * datos históricos de quienes ya la tenían asignada.
 */
export default {
  async up(queryInterface) {
    await queryInterface.addColumn('city', 'active', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('city', 'active');
  },
};
