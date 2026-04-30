import bcrypt from 'bcryptjs';

export default {
  async up(queryInterface) {
    const email    = process.env.SUPER_ADMIN_EMAIL    || 'superadmin@donpunto.com';
    const password = process.env.SUPER_ADMIN_PASSWORD;
    const name     = process.env.SUPER_ADMIN_NAME     || 'Super Admin DonPunto';

    if (!password) {
      throw new Error('Fallo de Seguridad: La variable de entorno SUPER_ADMIN_PASSWORD es obligatoria para el seeder.');
    }

    const password_hash = await bcrypt.hash(password, 12);

    const [roles] = await queryInterface.sequelize.query(
      `SELECT role_id FROM role WHERE name = 'super_admin' LIMIT 1`
    );

    if (!roles.length) {
      throw new Error('Rol super_admin no encontrado. Ejecuta el seeder de roles primero.');
    }

    const roleId = roles[0].role_id;

    await queryInterface.bulkInsert('user', [
      {
        tenant_id:     null,
        role_id:       roleId,
        name,
        email,
        password_hash,
        active:        true,
        created_at:    new Date(),
        updated_at:    new Date(),
      },
    ]);

    console.log(`✅ Super Admin creado: ${email}`);
  },

  async down(queryInterface) {
    const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@donpunto.com';
    await queryInterface.bulkDelete('user', { email });
  },
};
