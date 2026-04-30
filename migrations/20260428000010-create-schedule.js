import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('schedule', {
      schedule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      branch_id:   { type: DataTypes.INTEGER, allowNull: false, references: { model: 'branch', key: 'branch_id' }, onDelete: 'CASCADE' },
      dia_semana:  { type: DataTypes.INTEGER, allowNull: false }, // 0=Domingo, 1=Lunes...
      open_hour:   { type: DataTypes.TIME, allowNull: true },
      close_hour:  { type: DataTypes.TIME, allowNull: true },
      closed:      { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at:  { type: DataTypes.DATE, allowNull: false },
      updated_at:  { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('schedule');
  },
};
