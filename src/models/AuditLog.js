import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    audit_id:    { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:   { type: DataTypes.INTEGER, allowNull: true },
    user_id:     { type: DataTypes.INTEGER, allowNull: true },
    table_name:  { type: DataTypes.STRING(100), allowNull: false },
    record_id:   { type: DataTypes.INTEGER, allowNull: true },
    action:      { type: DataTypes.STRING(50), allowNull: false },
    old_values:  { type: DataTypes.JSONB, allowNull: true },
    new_values:  { type: DataTypes.JSONB, allowNull: true },
    ip_address:  { type: DataTypes.STRING(50), allowNull: true },
  }, {
    tableName:   'audit_log',
    timestamps:  true,
    underscored: true,
  });

  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    AuditLog.belongsTo(models.User,   { foreignKey: 'user_id',   as: 'user' });
  };

  return AuditLog;
};
