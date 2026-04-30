export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('qr_code', {
      qr_code_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'tenant', key: 'tenant_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      menu_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'menu', key: 'menu_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'branch', key: 'branch_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      qr_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'general', // 'general', 'table'
      },
      table_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '#000000',
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('qr_code');
  },
};
