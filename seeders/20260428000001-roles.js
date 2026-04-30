export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert('role', [
      {
        name:        'super_admin',
        description: 'Administrador global de la plataforma DonPunto. Acceso a todos los tenants.',
        active:      true,
        created_at:  new Date(),
        updated_at:  new Date(),
      },
      {
        name:        'admin',
        description: 'Administrador del restaurante. Gestiona su propio menú, productos y configuración.',
        active:      true,
        created_at:  new Date(),
        updated_at:  new Date(),
      },
      {
        name:        'viewer',
        description: 'Acceso de solo lectura dentro del tenant.',
        active:      true,
        created_at:  new Date(),
        updated_at:  new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('role', {
      name: ['super_admin', 'admin', 'viewer'],
    });
  },
};
