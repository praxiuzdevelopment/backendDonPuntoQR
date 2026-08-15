/**
 * Plantillas base de DonPunto.
 *
 * Cada una es una composición de bloques, no un componente distinto: el
 * frontend tiene un único renderizador que interpreta `layout`. Añadir una
 * plantilla es añadir una fila aquí, y el futuro constructor de plantillas
 * editará exactamente esta misma estructura.
 *
 * Los colores NO se definen aquí: los pone cada restaurante en su menú
 * (`menu.primary_color` / `secondary_color`).
 */

const templates = [
  {
    name: 'Clásica',
    code_name: 'classic',
    description:
      'Lista compacta con foto pequeña a un lado. Rinde bien con cartas largas y muchos productos.',
    layout: {
      blocks: ['header', 'categoryNav', 'sections', 'footer'],
      options: {
        header: { variant: 'centered', showLogo: true, showAddress: true },
        categoryNav: { sticky: true, style: 'pills' },
        sections: {
          itemLayout: 'row',
          imageSize: 'sm',
          showPriceInline: true,
          groupTitle: 'bar',
        },
        footer: { showPhones: true, showSocials: true, showSchedule: true },
      },
      tokens: { density: 'compact', radius: 'sm', accentUsage: 'bars' },
    },
  },
  {
    name: 'Vitrina',
    code_name: 'showcase',
    description:
      'Tarjetas con foto grande. Pensada para cartas cortas donde el producto entra por los ojos.',
    layout: {
      blocks: ['hero', 'categoryNav', 'sections', 'footer'],
      options: {
        hero: { variant: 'cover', showLogo: true, overlay: true },
        categoryNav: { sticky: true, style: 'tabs' },
        sections: {
          itemLayout: 'card',
          imageSize: 'lg',
          showPriceInline: false,
          groupTitle: 'plain',
        },
        footer: { showPhones: true, showSocials: true, showSchedule: false },
      },
      tokens: { density: 'comfortable', radius: 'lg', accentUsage: 'fills' },
    },
  },
  {
    name: 'Carta',
    code_name: 'elegant',
    description:
      'Sin fotos, tipografía protagonista y precios alineados. Para restaurantes donde la foto resta.',
    layout: {
      blocks: ['header', 'sections', 'footer'],
      options: {
        header: { variant: 'minimal', showLogo: true, showAddress: false },
        sections: {
          itemLayout: 'text',
          imageSize: 'none',
          showPriceInline: true,
          groupTitle: 'rule',
        },
        footer: { showPhones: true, showSocials: false, showSchedule: true },
      },
      tokens: { density: 'airy', radius: 'none', accentUsage: 'lines' },
    },
  },
];

export default {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'template',
      templates.map((t) => ({
        name:        t.name,
        code_name:   t.code_name,
        description: t.description,
        layout:      JSON.stringify(t.layout),
        active:      true,
        created_at:  new Date(),
        updated_at:  new Date(),
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('template', {
      code_name: templates.map((t) => t.code_name),
    });
  },
};
