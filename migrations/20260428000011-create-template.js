import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('template', {
      template_id:   { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name:          { type: DataTypes.STRING(150), allowNull: false },
      description:   { type: DataTypes.STRING(255), allowNull: true },
      preview_image: { type: DataTypes.STRING(500), allowNull: true },
      code_name:     { type: DataTypes.STRING(100), allowNull: false, unique: true },
      active:        { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:    { type: DataTypes.DATE, allowNull: false },
      updated_at:    { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('template');
  },
};
