---
id: qr-system
title: Sistema de Códigos QR
sidebar_label: 4. Códigos QR
---

# Sistema de Generación de Códigos QR

El sistema de Códigos QR de DonPunto permite a los restaurantes generar identificadores visuales únicos para que los comensales accedan al menú digital desde sus dispositivos móviles, de forma rápida y sin necesidad de descargar aplicaciones nativas.

## Arquitectura del Modelo Híbrido

Para cumplir con la flexibilidad del mercado gastronómico, el modelo de datos de códigos QR (`QRCode`) está diseñado bajo una arquitectura híbrida:

1. **QR Global por Restaurante**: Genera un único código para todo el establecimiento. Ideal para restaurantes de comida rápida o barras.
2. **QR Específico por Mesa**: Genera códigos individuales vinculados a una mesa específica (`table_number`). Ideal para restaurantes a la carta y pedidos a la mesa.

```mermaid
erDiagram
    Tenant ||--o{ QRCode : "genera"
    QRCode {
        UUID id PK
        UUID tenant_id FK
        String code "Identificador único"
        String table_number "Opcional (Ej: 'Mesa 4')"
        String color "Hexadecimal"
        String base64_image "Caché de imagen"
    }
```

## Flujo de Interacción del Comensal

Cuando el comensal escanea el código QR, este redirige a la URL pública del Frontend (ej. `app.donpunto.com/m/{code}`). El frontend inmediatamente consulta nuestra API pública para obtener el menú completo.

```mermaid
sequenceDiagram
    participant C as Comensal (Móvil)
    participant F as Frontend PWA
    participant API as Backend (Public API)
    participant DB as Base de Datos

    C->>F: Escanea QR y abre URL
    F->>API: GET /api/v1/public/menus/{code}
    API->>DB: Busca QRCode y Tenant
    DB-->>API: Retorna Tenant ID
    API->>DB: Consulta Menú Activo + Eager Loading (Categorías/Productos)
    DB-->>API: Retorna árbol JSON optimizado
    API-->>F: Responde JSON (200 OK)
    F-->>C: Renderiza Menú Interactivo
```

## Ventajas Técnicas
* **Eager Loading**: El controlador público consolida todas las consultas en un solo JSON estructurado, reduciendo las peticiones HTTP (N+1 query problem).
* **Base64 Native**: Las imágenes QR se envían como strings en Base64, evitando costos de almacenamiento de imágenes estáticas en S3 para algo tan volátil.
