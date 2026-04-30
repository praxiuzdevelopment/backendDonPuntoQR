# Constructor de Menús (Menu Builder)

En MenuQR, un "Menú" no es simplemente un catálogo de productos, sino **una estructura visual ordenada**. Un restaurante puede tener varios menús (Ej: "Menú Ejecutivo", "Menú de Fin de Semana", "Carta de Vinos").

## Tablas Pivote (La Magia Relacional)

Para poder asignar categorías y productos a un menú, y al mismo tiempo mantener el **orden específico** en el que el dueño quiere que aparezcan, usamos **Tablas Pivote con atributos adicionales** (Relaciones N:M).

1. **`Menu`**: Tabla principal. Almacena el nombre del menú, colores primarios/secundarios, y fechas de vigencia si es un menú temporal.
2. **`MenuCategory`**: Tabla que une un Menú con una Categoría. Su campo estrella es `display_order`. Esto permite que la categoría "Bebidas" sea la #1 en el Menú de Día, pero la #3 en el Menú de Noche.
3. **`MenuProduct`**: Tabla que une un Menú con un Producto. También tiene `display_order`, y además campos específicos de la vista como `show_description` o `featured` (para destacar productos estrella en ese menú en particular).

## Actualización Transaccional

Dado que el frontend enviará una estructura anidada compleja al guardar un menú (Categorías y dentro Productos, todos con un orden específico), intentar hacer un "diff" (comparar qué se borró, qué se añadió y qué cambió de orden) a nivel de base de datos es propenso a errores.

**La estrategia elegida es la Actualización Transaccional (Drop & Recreate):**

Cuando se llama al endpoint `PUT /api/v1/menus/:id/structure`:
1. Se abre una Transacción en PostgreSQL.
2. Se eliminan **todos** los registros de `MenuCategory` y `MenuProduct` asociados a ese `menu_id`.
3. Se insertan masivamente en bloque los nuevos registros con el nuevo orden proporcionado por el frontend.
4. Si algo falla a la mitad, se hace un `Rollback` y el menú queda intacto como estaba antes. Si todo sale bien, se hace un `Commit`.

Esto garantiza consistencia total y código backend extremadamente limpio.
