/**
 * Un código QR no sobrevive a su menú.
 *
 * La clave foránea era `ON DELETE SET NULL`, así que al borrar un menú el QR
 * quedaba huérfano — y el menú público, al no encontrar `menu_id`, servía el
 * menú activo más reciente del restaurante. Es decir: un QR ya impreso empezaba
 * a mostrar una carta distinta sin avisar a nadie.
 *
 * Con CASCADE el QR desaparece con su menú y el código impreso responde
 * "código inválido", que es la verdad.
 */
export default {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE qr_code DROP CONSTRAINT IF EXISTS qr_code_menu_id_fkey;
      ALTER TABLE qr_code
        ADD CONSTRAINT qr_code_menu_id_fkey
        FOREIGN KEY (menu_id) REFERENCES menu (menu_id)
        ON UPDATE CASCADE ON DELETE CASCADE;
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE qr_code DROP CONSTRAINT IF EXISTS qr_code_menu_id_fkey;
      ALTER TABLE qr_code
        ADD CONSTRAINT qr_code_menu_id_fkey
        FOREIGN KEY (menu_id) REFERENCES menu (menu_id)
        ON UPDATE CASCADE ON DELETE SET NULL;
    `);
  },
};
