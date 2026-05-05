import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Product = sequelize.define('Product', {
    product_id:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:   { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: false },
    name:        { type: DataTypes.STRING(150), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    price:       { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    image_url:   { type: DataTypes.STRING(500), allowNull: true },
    featured:    { type: DataTypes.BOOLEAN, defaultValue: false },
    available:   { type: DataTypes.BOOLEAN, defaultValue: true },
    is_combo:    { type: DataTypes.BOOLEAN, defaultValue: false },
    sort_order:  { type: DataTypes.INTEGER, defaultValue: 0 },
    restock_at:  { type: DataTypes.DATE, allowNull: true },
    restock_qty: { type: DataTypes.INTEGER, allowNull: true },
    active:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'product',
    timestamps:  true,
    underscored: true,
  });

  Product.associate = (models) => {
    Product.belongsTo(models.Tenant,   { foreignKey: 'tenant_id',   as: 'tenant' });
    Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  };

  return Product;
};
