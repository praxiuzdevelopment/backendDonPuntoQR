import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('user', {
      user_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id:     { type: DataTypes.INTEGER, allowNull: true, references: { model: 'tenant', key: 'tenant_id' }, onDelete: 'CASCADE' },
      role_id:       { type: DataTypes.INTEGER, allowNull: false, references: { model: 'role', key: 'role_id' } },
      name:          { type: DataTypes.STRING(150), allowNull: false },
      email:         { type: DataTypes.STRING(150), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      active:        { type: DataTypes.BOOLEAN, defaultValue: true },
      created_at:    { type: DataTypes.DATE, allowNull: false },
      updated_at:    { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('user');
  },
};
