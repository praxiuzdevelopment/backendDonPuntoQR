import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('category', {
      category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'CASCADE' },
      name:        { type: DataTypes.STRING(150), allowNull: false },
      description: { type: DataTypes.STRING(255), allowNull: true },
      active:      { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:  { type: DataTypes.DATE, allowNull: false },
      updated_at:  { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('category');
  },
};
