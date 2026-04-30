const cities = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena',
  'Cúcuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Ibagué',
  'Pasto', 'Manizales', 'Neiva', 'Villavicencio', 'Armenia',
  'Valledupar', 'Montería', 'Sincelejo', 'Popayán', 'Florencia',
  'Tunja', 'Riohacha', 'Quibdó', 'Arauca', 'Yopal',
  'Mocoa', 'Mitú', 'Puerto Inírida', 'San José del Guaviare', 'Leticia',
];

export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'city',
      cities.map((description) => ({ description, created_at: new Date(), updated_at: new Date() }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('city', { description: cities });
  },
};
