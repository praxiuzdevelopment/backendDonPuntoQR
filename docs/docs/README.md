# Documentación Interna — Backend MenuQR (DonPunto)

Este directorio contiene la documentación técnica y de arquitectura del sistema. Al estar en formato Markdown (`.md`), estas guías pueden integrarse fácilmente en el futuro con generadores de sitios estáticos como **Docusaurus**, **VitePress** o **Material for MkDocs**.

## Índice de Contenidos

1. [Autenticación y Arquitectura Multi-Tenant](./01-multi-tenant-auth.md)
   - Explicación de cómo el sistema aísla los datos entre diferentes restaurantes usando `tenant_id`.
   - Control de acceso basado en roles (RBAC).

2. [Gestión de Catálogo e Inventario](./02-catalog-management.md)
   - Estructura de categorías y productos.
   - Lógica de auto-restock (reactivación automática de inventario).
   - Manejo de importación masiva (CSV/Excel).

3. [Construcción de Menús y Plantillas](./03-menu-builder.md)
   - Explicación del modelo relacional avanzado (Tablas Pivote).
   - Lógica para asignar categorías y productos a un menú conservando un orden visual.

> **Tip para el desarrollador:** Si necesitas actualizar un flujo de negocio crítico, asegúrate de actualizar el archivo markdown correspondiente en este directorio para mantener la verdad técnica sincronizada con el código.
