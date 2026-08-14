/**
 * Una licencia vigente por restaurante.
 *
 * `renewLicense` usaba `License.upsert({ tenant_id, ... })` sin clave única
 * sobre tenant_id, así que cada renovación insertaba una fila nueva en lugar
 * de actualizar, y `Tenant.hasOne(License)` devolvía una cualquiera.
 *
 * Antes de crear el índice hay que consolidar lo que ya exista: nos quedamos
 * con la licencia de vencimiento más lejano de cada restaurante, que es la
 * que refleja lo que el cliente pagó.
 */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM license
      WHERE license_id NOT IN (
        SELECT DISTINCT ON (tenant_id) license_id
        FROM license
        ORDER BY tenant_id, end_date DESC, license_id DESC
      );
    `);

    await queryInterface.addIndex('license', ['tenant_id'], {
      unique: true,
      name: 'license_tenant_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('license', 'license_tenant_id_unique');
  },
};
