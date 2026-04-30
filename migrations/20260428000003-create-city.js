import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('city', {
      city_id:     { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      description: { type: DataTypes.STRING(100), allowNull: false },
      created_at:  { type: DataTypes.DATE, allowNull: false },
      updated_at:  { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('city');
  },
};
