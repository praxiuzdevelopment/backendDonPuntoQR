import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('branch', {
      branch_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'CASCADE' },
      city_id:         { type: DataTypes.INTEGER, allowNull: true, references: { model: 'city', key: 'city_id' }, onDelete: 'SET NULL' },
      name:            { type: DataTypes.STRING(150), allowNull: false },
      address:         { type: DataTypes.STRING(255), allowNull: false },
      phone_1:         { type: DataTypes.STRING(50), allowNull: true },
      whatsapp_number: { type: DataTypes.STRING(50), allowNull: true },
      instagram_url:   { type: DataTypes.STRING(255), allowNull: true },
      facebook_url:    { type: DataTypes.STRING(255), allowNull: true },
      tiktok_url:      { type: DataTypes.STRING(255), allowNull: true },
      manager_id:      { type: DataTypes.INTEGER, allowNull: true, references: { model: 'user', key: 'user_id' }, onDelete: 'SET NULL' },
      active:          { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:      { type: DataTypes.DATE, allowNull: false },
      updated_at:      { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('branch');
  },
};
