import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Template = sequelize.define('Template', {
    template_id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:          { type: DataTypes.STRING(150), allowNull: false },
    description:   { type: DataTypes.STRING(255), allowNull: true },
    preview_image: { type: DataTypes.STRING(500), allowNull: true },
    code_name:     { type: DataTypes.STRING(100), allowNull: false, unique: true },
    layout:        { type: DataTypes.JSONB, allowNull: false, defaultValue: {},
                     comment: 'Bloques, orden y opciones que componen la plantilla' },
    active:        { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName:   'template',
    timestamps:  true,
    underscored: true,
  });

  Template.associate = (models) => {
    if (models.Menu) Template.hasMany(models.Menu, { foreignKey: 'template_id', as: 'menus' });
  };

  return Template;
};
