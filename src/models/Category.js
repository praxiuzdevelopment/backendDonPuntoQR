import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Category = sequelize.define('Category', {
    category_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:   { type: DataTypes.INTEGER, allowNull: false },
    name:        { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'category',
    timestamps:  true,
    underscored: true,
  });

  Category.associate = (models) => {
    Category.belongsTo(models.Tenant, { foreignKey: 'tenant_id', as: 'tenant' });
    if (models.Product) Category.hasMany(models.Product, { foreignKey: 'category_id', as: 'products' });
  };

  return Category;
};
