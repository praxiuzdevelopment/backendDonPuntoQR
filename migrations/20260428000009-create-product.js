import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('product', {
      product_id:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'CASCADE' },
      category_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'category', key: 'category_id' }, onDelete: 'CASCADE' },
      name:        { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: true },
      price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      image_url:   { type: DataTypes.STRING(500), allowNull: true },
      featured:    { type: DataTypes.BOOLEAN, defaultValue: false },
      available:   { type: DataTypes.BOOLEAN, defaultValue: true },
      is_combo:    { type: DataTypes.BOOLEAN, defaultValue: false },
      restock_at:  { type: DataTypes.DATE, allowNull: true },
      restock_qty: { type: DataTypes.INTEGER, allowNull: true },
      active:      { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:  { type: DataTypes.DATE, allowNull: false },
      updated_at:  { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('product');
  },
};
