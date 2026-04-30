import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('menu_category', {
      menu_cat_id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      menu_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: 'menu', key: 'menu_id' }, onDelete: 'CASCADE' },
      category_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: 'category', key: 'category_id' }, onDelete: 'CASCADE' },
      display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
      active:        { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:    { type: DataTypes.DATE, allowNull: false },
      updated_at:    { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('menu_category');
  },
};
