import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MenuCategory = sequelize.define('MenuCategory', {
    menu_cat_id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    menu_id:       { type: DataTypes.INTEGER, allowNull: false },
    category_id:   { type: DataTypes.INTEGER, allowNull: false },
    display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    active:        { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'menu_category',
    timestamps:  true,
    underscored: true,
  });

  MenuCategory.associate = (models) => {
    MenuCategory.belongsTo(models.Menu,     { foreignKey: 'menu_id',     as: 'menu' });
    MenuCategory.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
  };

  return MenuCategory;
};
