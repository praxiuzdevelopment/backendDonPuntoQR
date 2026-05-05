import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Branch = sequelize.define('Branch', {
    branch_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:       { type: DataTypes.INTEGER, allowNull: false },
    city_id:         { type: DataTypes.INTEGER, allowNull: true },
    name:            { type: DataTypes.STRING(150), allowNull: false },
    address:         { type: DataTypes.STRING(255), allowNull: false },
    phone_1:         { type: DataTypes.STRING(50), allowNull: true },
    phone_2:         { type: DataTypes.STRING(50), allowNull: true },
    email:           { type: DataTypes.STRING(150), allowNull: true },
    whatsapp_number: { type: DataTypes.STRING(50), allowNull: true },
    instagram_url:   { type: DataTypes.STRING(255), allowNull: true },
    facebook_url:    { type: DataTypes.STRING(255), allowNull: true },
    tiktok_url:      { type: DataTypes.STRING(255), allowNull: true },
    manager_id:      { type: DataTypes.INTEGER, allowNull: true },
    active:          { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'branch',
    timestamps:  true,
    underscored: true,
  });

  Branch.associate = (models) => {
    Branch.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    Branch.belongsTo(models.City,   { foreignKey: 'city_id',   as: 'city' });
    Branch.belongsTo(models.User,   { foreignKey: 'manager_id', as: 'manager' });
  };

  return Branch;
};
