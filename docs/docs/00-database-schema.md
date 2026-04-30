# Modelo Entidad-Relación (MER)

A medida que el proyecto ha evolucionado durante los Sprints 1, 2 y 3, la base de datos se ha robustecido con nuevos campos (redes sociales, control de inventario) y nuevas tablas (auditoría, estructura relacional de menús y horarios).

> [!NOTE]
> En lugar de mantener un archivo XML estático de Draw.io que es difícil de versionar en Git y propenso a corromperse, hemos migrado el diagrama a **Mermaid**. Este formato se renderiza automáticamente de forma visual en GitHub, GitLab, VSCode y herramientas como Docusaurus.

## Diagrama Completo y Actualizado

A continuación se presenta la estructura exacta que tiene la base de datos PostgreSQL actualmente en el contenedor Docker.

```mermaid
erDiagram
    tenant ||--o{ user : "has"
    tenant ||--o{ branch : "has"
    tenant ||--o{ category : "has"
    tenant ||--o{ product : "has"
    tenant ||--o{ menu : "has"
    tenant ||--o{ license : "has"
    tenant ||--o{ qr_code : "has"

    role ||--o{ user : "assigned_to"
    city ||--o{ branch : "located_in"
    user ||--o{ branch : "manages"

    category ||--o{ product : "contains"
    
    branch ||--o{ schedule : "has"

    template ||--o{ menu : "uses"

    menu ||--o{ menu_category : "includes"
    category ||--o{ menu_category : "included_in"

    menu ||--o{ menu_product : "includes"
    product ||--o{ menu_product : "included_in"

    tenant {
        int tenant_id PK
        string name
        string logo_url
        string slug
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    role {
        int role_id PK
        string name
        string description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    user {
        int user_id PK
        int tenant_id FK
        int role_id FK
        string name
        string email
        string password_hash
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    city {
        int city_id PK
        string name
        string state
        string country
    }

    branch {
        int branch_id PK
        int tenant_id FK
        int city_id FK
        int manager_id FK "References user_id"
        string name
        string address
        string phone_1
        string whatsapp_number
        string instagram_url
        string facebook_url
        string tiktok_url
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    schedule {
        int schedule_id PK
        int branch_id FK
        int dia_semana "0=Dom, 1=Lun..."
        time open_hour
        time close_hour
        boolean closed
        timestamp created_at
        timestamp updated_at
    }

    category {
        int category_id PK
        int tenant_id FK
        string name
        string description
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    product {
        int product_id PK
        int tenant_id FK
        int category_id FK
        string name
        string description
        decimal price
        string image_url
        boolean featured
        boolean available
        boolean is_combo
        timestamp restock_at
        int restock_qty
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    template {
        int template_id PK
        string name
        string description
        string preview_image
        string code_name
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    menu {
        int menu_id PK
        int tenant_id FK
        int template_id FK
        string name
        string primary_color
        string secondary_color
        string image_position
        string order_criteria
        boolean temporal
        timestamp start_date
        timestamp end_date
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    menu_category {
        int menu_cat_id PK
        int menu_id FK
        int category_id FK
        int display_order
        boolean active
        timestamp created_at
        timestamp updated_at
    }

    menu_product {
        int menu_prod_id PK
        int menu_id FK
        int product_id FK
        int display_order
        boolean show_description
        boolean featured
        boolean available
        timestamp created_at
        timestamp updated_at
    }

    audit_log {
        int audit_id PK
        int tenant_id FK
        int user_id FK
        string table_name
        int record_id
        string action "INSERT, UPDATE, DELETE"
        jsonb old_values
        jsonb new_values
        string ip_address
        timestamp created_at
        timestamp updated_at
    }

    license {
        int license_id PK
        int tenant_id FK
        timestamp start_date
        timestamp end_date
        string status
        string plan
        int grace_days
        string payment_reference
        timestamp created_at
        timestamp updated_at
    }

    qr_code {
        int qr_code_id PK
        int tenant_id FK
        int menu_id FK
        string code
        string qr_type
        string color
        boolean active
        timestamp created_at
        timestamp updated_at
    }
```

## Correcciones Aplicadas vs tu XML de Draw.io

1. **Tabla `user`**: Eliminamos `logo_url` y `cellphone` (no estaban en nuestra migración). Agregamos correctamente `password_hash`, `email` y `active`.
2. **Tabla `branch`**: Se añadieron los campos sociales solicitados (`tiktok_url`, `instagram_url`, `whatsapp_number`, etc) y el `manager_id` para vincular qué usuario administra la sucursal.
3. **Tabla `product`**: Se añadieron los campos para la lógica del auto-restock (`available`, `restock_at`, `restock_qty`) y combos (`is_combo`).
4. **Tabla `audit_log`**: Añadida para mantener la trazabilidad de quién y cuándo mutó los registros (Sprint 2).
5. **Tablas de Menús (`menu`, `template`, `menu_category`, `menu_product`, `schedule`)**: Añadidas para soportar el constructor de menús avanzado del Sprint 3.
6. **Tabla `qr_codes`**: La mantuvimos ya que será la estrella del Sprint 4.
