import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const License = sequelize.define('License', {
    license_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:  { type: DataTypes.INTEGER, allowNull: false,
                  references: { model: 'tenant', key: 'tenant_id' } },
    name:       { type: DataTypes.STRING(150), allowNull: false },
    plan:       { type: DataTypes.ENUM('free', 'basic', 'pro'), defaultValue: 'basic' },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date:   { type: DataTypes.DATE, allowNull: false },
    status:     { type: DataTypes.ENUM('active', 'expired', 'suspended'), defaultValue: 'active' },
    grace_days: { type: DataTypes.INTEGER, defaultValue: 7,
                  comment: 'Días de gracia tras expiración antes del corte de servicio' },
  }, {
    tableName:   'license',
    timestamps:  true,
    underscored: true,
  });

  License.associate = (models) => {
    License.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
  };

  return License;
};
