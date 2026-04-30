import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Tenant = sequelize.define('Tenant', {
    tenant_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:      { type: DataTypes.STRING(150), allowNull: false },
    logo_url:  { type: DataTypes.STRING(500), allowNull: true },
    slug:      { type: DataTypes.STRING(100), allowNull: false, unique: true,
                 comment: 'Identificador único para URLs públicas' },
    active:    { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:  'tenant',
    timestamps: true,
    underscored: true,
  });

  Tenant.associate = (models) => {
    Tenant.hasMany(models.User,    { foreignKey: 'tenant_id', as: 'users' });
    Tenant.hasOne(models.License,  { foreignKey: 'tenant_id', as: 'license' });
    if (models.Branch)   Tenant.hasMany(models.Branch,   { foreignKey: 'tenant_id', as: 'branches' });
    if (models.Category) Tenant.hasMany(models.Category, { foreignKey: 'tenant_id', as: 'categories' });
    if (models.Product)  Tenant.hasMany(models.Product,  { foreignKey: 'tenant_id', as: 'products' });
    if (models.Menu)     Tenant.hasMany(models.Menu,     { foreignKey: 'tenant_id', as: 'menus' });
  };

  return Tenant;
};
