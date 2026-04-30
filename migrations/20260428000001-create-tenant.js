import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('tenant', {
      tenant_id:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name:       { type: DataTypes.STRING(150), allowNull: false },
      logo_url:   { type: DataTypes.STRING(500), allowNull: true },
      slug:       { type: DataTypes.STRING(100), allowNull: false, unique: true },
      active:     { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('tenant');
  },
};
