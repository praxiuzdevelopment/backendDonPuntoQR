import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('license', {
      license_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:  { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'CASCADE' },
      name:       { type: DataTypes.STRING(150), allowNull: false },
      plan:       { type: DataTypes.ENUM('free', 'basic', 'pro'), defaultValue: 'basic' },
      start_date: { type: DataTypes.DATE, allowNull: false },
      end_date:   { type: DataTypes.DATE, allowNull: false },
      status:     { type: DataTypes.ENUM('active', 'expired', 'suspended'), defaultValue: 'active' },
      grace_days: { type: DataTypes.INTEGER, defaultValue: 7 },
      created_at: { type: DataTypes.DATE, allowNull: false },
      updated_at: { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('license');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_license_plan" CASCADE;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_license_status" CASCADE;');
  },
};
