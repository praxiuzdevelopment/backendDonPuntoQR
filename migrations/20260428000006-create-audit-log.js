import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('audit_log', {
      audit_id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:   { type: DataTypes.INTEGER, allowNull: true, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'SET NULL' },
      user_id:     { type: DataTypes.INTEGER, allowNull: true, references: { model: 'user', key: 'user_id' }, onDelete: 'SET NULL' },
      table_name:  { type: DataTypes.STRING(100), allowNull: false },
      record_id:   { type: DataTypes.INTEGER, allowNull: true },
      action:      { type: DataTypes.STRING(50), allowNull: false },
      old_values:  { type: DataTypes.JSONB, allowNull: true },
      new_values:  { type: DataTypes.JSONB, allowNull: true },
      ip_address:  { type: DataTypes.STRING(50), allowNull: true },
      created_at:  { type: DataTypes.DATE, allowNull: false },
      updated_at:  { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('audit_log');
  },
};
