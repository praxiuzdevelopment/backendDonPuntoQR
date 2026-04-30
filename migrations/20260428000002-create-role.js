import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('role', {
      role_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name:        { type: DataTypes.STRING(50), allowNull: false, unique: true },
      description: { type: DataTypes.STRING(255), allowNull: true },
      active:      { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:  { type: DataTypes.DATE, allowNull: false },
      updated_at:  { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('role');
  },
};
