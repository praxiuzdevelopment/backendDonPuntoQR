export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'last_name', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
    await queryInterface.addColumn('user', 'phone', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'last_name');
    await queryInterface.removeColumn('user', 'phone');
  }
};
