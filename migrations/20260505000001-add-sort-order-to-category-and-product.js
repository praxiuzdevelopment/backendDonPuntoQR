export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('category', 'sort_order', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
    await queryInterface.addColumn('product', 'sort_order', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('category', 'sort_order');
    await queryInterface.removeColumn('product', 'sort_order');
  }
};
