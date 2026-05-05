export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('branch', 'phone_2', {
      type: Sequelize.STRING(50),
      allowNull: true,
    });
    await queryInterface.addColumn('branch', 'email', {
      type: Sequelize.STRING(150),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('branch', 'phone_2');
    await queryInterface.removeColumn('branch', 'email');
  }
};
