import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('menu', {
      menu_id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'CASCADE' },
      template_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: 'template', key: 'template_id' } },
      name:            { type: DataTypes.STRING(150), allowNull: false },
      primary_color:   { type: DataTypes.STRING(50), defaultValue: '#FF4500' },
      secondary_color: { type: DataTypes.STRING(50), defaultValue: '#FFFFFF' },
      image_position:  { type: DataTypes.STRING(50), defaultValue: 'left' },
      order_criteria:  { type: DataTypes.STRING(50), defaultValue: 'custom' },
      temporal:        { type: DataTypes.BOOLEAN, defaultValue: false },
      start_date:      { type: DataTypes.DATE, allowNull: true },
      end_date:        { type: DataTypes.DATE, allowNull: true },
      active:          { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:      { type: DataTypes.DATE, allowNull: false },
      updated_at:      { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('menu');
  },
};
