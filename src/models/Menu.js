import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Menu = sequelize.define('Menu', {
    menu_id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id:       { type: DataTypes.INTEGER, allowNull: false },
    template_id:     { type: DataTypes.INTEGER, allowNull: false },
    name:            { type: DataTypes.STRING(150), allowNull: false },
    primary_color:   { type: DataTypes.STRING(50), defaultValue: '#FF4500' },
    secondary_color: { type: DataTypes.STRING(50), defaultValue: '#FFFFFF' },
    image_position:  { type: DataTypes.STRING(50), defaultValue: 'left' },
    order_criteria:  { type: DataTypes.STRING(50), defaultValue: 'custom' },
    is_default:      { type: DataTypes.BOOLEAN, defaultValue: false,
                       comment: 'Carta de siempre del restaurante' },
    temporal:        { type: DataTypes.BOOLEAN, defaultValue: false },
    start_date:      { type: DataTypes.DATE, allowNull: true },
    end_date:        { type: DataTypes.DATE, allowNull: true },
    active:          { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'menu',
    timestamps:  true,
    underscored: true,
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.Tenant,   { foreignKey: 'tenant_id',   as: 'tenant' });
    Menu.belongsTo(models.Template, { foreignKey: 'template_id', as: 'template' });
    
    // Acceso directo a las tablas puente: el renderizado necesita sus columnas
    // propias (display_order, show_description, featured, available), que la
    // asociación N:M sólo expone de forma incómoda.
    if (models.MenuCategory) {
      Menu.hasMany(models.MenuCategory, { foreignKey: 'menu_id', as: 'menu_categories' });
    }
    if (models.MenuProduct) {
      Menu.hasMany(models.MenuProduct, { foreignKey: 'menu_id', as: 'menu_products' });
    }

    // N:M Associations
    if (models.Category) {
      Menu.belongsToMany(models.Category, { 
        through: models.MenuCategory, 
        foreignKey: 'menu_id', 
        otherKey: 'category_id',
        as: 'categories' 
      });
    }
    
    if (models.Product) {
      Menu.belongsToMany(models.Product, { 
        through: models.MenuProduct, 
        foreignKey: 'menu_id', 
        otherKey: 'product_id',
        as: 'products' 
      });
    }
  };

  return Menu;
};
