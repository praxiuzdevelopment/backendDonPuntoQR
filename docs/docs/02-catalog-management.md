# Gestión de Catálogo e Inventario

El catálogo es la base sobre la que se construyen los menús. Los restaurantes primero definen sus **Categorías** y luego crean sus **Productos**, asignándoles precio, descripción, tipo (normal o combo) y manejando su disponibilidad.

## Imágenes en la Nube (Cloudinary)

Las imágenes de los productos no se almacenan físicamente en el servidor para garantizar la escalabilidad en Docker.
1. El backend recibe la imagen a través de `multer`, la cual la procesa en memoria (`memoryStorage`).
2. Luego, convierte el buffer a una cadena en base64 (Data URI) y la sube a **Cloudinary**.
3. La URL segura devuelta por Cloudinary (`secure_url`) es lo que finalmente se guarda en la base de datos de PostgreSQL.

*Los assets se agrupan en Cloudinary bajo la ruta: `menuqr/{tenant_id}/products/`.*

## Lógica de Auto-Restock (Inventario Inteligente)

A diferencia de un sistema de inventario tradicional donde un usuario debe recordar marcar un producto como disponible nuevamente al día siguiente, MenuQR soporta **Auto-Restock**.

- Cuando un administrador marca un producto como "Agotado", puede enviar opcionalmente una fecha de reactivación (`restock_at`).
- Cada vez que se consulta la lista de productos, el backend intercepta aquellos que tienen `available: false` y compara `restock_at` con el tiempo actual (`NOW()`).
- Si la fecha de reactivación ya pasó, el backend silenciosamente actualiza la base de datos a `available: true` y limpia los campos de restock, devolviendo el producto como disponible al instante.

## Carga Masiva (Bulk Upload)

Para facilitar el onboarding de nuevos clientes con catálogos extensos, el sistema soporta cargas masivas a través de archivos **CSV y Excel (.xlsx)**.

- **Herramientas:** Se usa `csv-parser` para leer CSVs y `xlsx` para archivos de Excel, operando directamente sobre el buffer en memoria.
- **Auto-creación:** Si el archivo menciona una categoría que no existe (`category_name`), el sistema la crea automáticamente en vuelo antes de insertar el producto, reduciendo la fricción manual.
