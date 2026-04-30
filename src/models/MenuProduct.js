import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MenuProduct = sequelize.define('MenuProduct', {
    menu_prod_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    menu_id:          { type: DataTypes.INTEGER, allowNull: false },
    product_id:       { type: DataTypes.INTEGER, allowNull: false },
    display_order:    { type: DataTypes.INTEGER, defaultValue: 0 },
    show_description: { type: DataTypes.BOOLEAN, defaultValue: true },
    featured:         { type: DataTypes.BOOLEAN, defaultValue: false },
    available:        { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'menu_product',
    timestamps:  true,
    underscored: true,
  });

  MenuProduct.associate = (models) => {
    MenuProduct.belongsTo(models.Menu,    { foreignKey: 'menu_id',    as: 'menu' });
    MenuProduct.belongsTo(models.Product, { foreignKey: 'product_id', as: 'product' });
  };

  return MenuProduct;
};
