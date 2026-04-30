import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Role = sequelize.define('Role', {
    role_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:        { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255), allowNull: true },
    active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'role',
    timestamps:  true,
    underscored: true,
  });

  Role.associate = (models) => {
    Role.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
  };

  return Role;
};
