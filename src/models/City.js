import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const City = sequelize.define('City', {
    city_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: DataTypes.STRING(100), allowNull: false },
    active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'city',
    timestamps:  true,
    underscored: true,
  });

  City.associate = (models) => {
    if (models.Branch) City.hasMany(models.Branch, { foreignKey: 'city_id', as: 'branches' });
  };

  return City;
};
