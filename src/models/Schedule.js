import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Schedule = sequelize.define('Schedule', {
    schedule_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    branch_id:   { type: DataTypes.INTEGER, allowNull: false },
    dia_semana:  { type: DataTypes.INTEGER, allowNull: false },
    open_hour:   { type: DataTypes.TIME, allowNull: true },
    close_hour:  { type: DataTypes.TIME, allowNull: true },
    closed:      { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    tableName:   'schedule',
    timestamps:  true,
    underscored: true,
  });

  Schedule.associate = (models) => {
    Schedule.belongsTo(models.Branch, { foreignKey: 'branch_id', as: 'branch' });
  };

  return Schedule;
};
