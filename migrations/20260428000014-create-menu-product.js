import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('menu_product', {
      menu_prod_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      menu_id:          { type: DataTypes.INTEGER, allowNull: false, references: { model: 'menu', key: 'menu_id' }, onDelete: 'CASCADE' },
      product_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: 'product', key: 'product_id' }, onDelete: 'CASCADE' },
      display_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
      show_description: { type: DataTypes.BOOLEAN, defaultValue: true },
      featured:         { type: DataTypes.BOOLEAN, defaultValue: false },
      available:        { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:       { type: DataTypes.DATE, allowNull: false },
      updated_at:       { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('menu_product');
  },
};
