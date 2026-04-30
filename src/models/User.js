import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    user_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:     { type: DataTypes.INTEGER, allowNull: true,
                     comment: 'Null para super_admin (staff DonPunto)',
                     references: { model: 'tenant', key: 'tenant_id' } },
    role_id:       { type: DataTypes.INTEGER, allowNull: false,
                     references: { model: 'role', key: 'role_id' } },
    name:          { type: DataTypes.STRING(150), allowNull: false },
    email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    active:        { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'user',
    timestamps:  true,
    underscored: true,
    defaultScope: {
      attributes: { exclude: ['password_hash'] }
    },
    scopes: {
      withPassword: { attributes: {} }
    }
  });

  User.associate = (models) => {
    User.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    User.belongsTo(models.Role,   { foreignKey: 'role_id',   as: 'role' });
    if (models.Branch) User.hasMany(models.Branch, { foreignKey: 'manager_id', as: 'managed_branches' });
  };

  return User;
};
